import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  SEED_APPLICATIONS,
  SEED_CONVERSATIONS,
  SEED_FAVORITES_BY_USER,
  SEED_OPPORTUNITIES,
  SEED_USERS,
  SEED_VIEWED_BY_USER,
} from '../data/mockDatabase';
import {
  Application,
  ApplicationStatus,
  Conversation,
  CreateOpportunityPayload,
  Opportunity,
  OpportunityFilters,
  User,
} from '../types/mora';

const STORAGE_KEYS = {
  users: 'mora_plus_users_v1',
  currentUserId: 'mora_plus_current_user_id_v1',
  opportunities: 'mora_plus_opportunities_v1',
  applications: 'mora_plus_applications_v1',
  conversations: 'mora_plus_conversations_v1',
  favorites: 'mora_plus_favorites_v1',
  viewed: 'mora_plus_viewed_v1',
};

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return structuredClone(fallback);
    }
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

function writeStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildResponse<T>(data: T, config: AxiosRequestConfig, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Created',
    headers: {},
    config: config as AxiosResponse['config'],
  };
}

function parseBody<T>(data: unknown): T {
  if (typeof data === 'string') {
    return JSON.parse(data) as T;
  }
  return data as T;
}

async function mockAxiosAdapter(config: AxiosRequestConfig): Promise<AxiosResponse> {
  await delay(90);

  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const [path, queryString] = url.split('?');
  const params = new URLSearchParams(queryString || '');

  // --- AUTH ---
  if (path === '/auth/session' && method === 'get') {
    const currentId = localStorage.getItem(STORAGE_KEYS.currentUserId);
    if (!currentId) return buildResponse(null, config);
    const users = readStore<User[]>(STORAGE_KEYS.users, SEED_USERS);
    const user = users.find((u) => u.id === currentId) || null;
    return buildResponse(user, config);
  }

  if (path === '/auth/login' && method === 'post') {
    const { email, demoUserId } = parseBody<{ email?: string; password?: string; demoUserId?: string }>(config.data);
    const users = readStore<User[]>(STORAGE_KEYS.users, SEED_USERS);
    const found = demoUserId
      ? users.find((u) => u.id === demoUserId)
      : users.find((u) => u.email.toLowerCase() === (email || '').trim().toLowerCase());

    if (!found) {
      throw Object.assign(new Error('Conta não encontrada. Utilize uma das contas demonstrativas ou cadastre-se.'), {
        response: { status: 401, data: { message: 'E-mail não cadastrado na demonstração.' } },
      });
    }
    localStorage.setItem(STORAGE_KEYS.currentUserId, found.id);
    return buildResponse(found, config);
  }

  if (path === '/auth/register' && method === 'post') {
    const payload = parseBody<Omit<User, 'id' | 'verificado' | 'membroDesde'>>(config.data);
    const users = readStore<User[]>(STORAGE_KEYS.users, SEED_USERS);
    const exists = users.some((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (exists) {
      throw Object.assign(new Error('Já existe uma conta com este e-mail.'), {
        response: { status: 409, data: { message: 'Já existe uma conta cadastrada com este e-mail.' } },
      });
    }
    const newUser: User = {
      ...payload,
      id: `usr-${Date.now()}`,
      verificado: true,
      membroDesde: new Date().toISOString().slice(0, 10),
      planoAtual: payload.role === 'proprietario' ? 'Anúncio Básico' : undefined,
    };
    users.push(newUser);
    writeStore(STORAGE_KEYS.users, users);
    localStorage.setItem(STORAGE_KEYS.currentUserId, newUser.id);
    return buildResponse(newUser, config, 201);
  }

  if (path === '/auth/logout' && method === 'post') {
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
    return buildResponse({ ok: true }, config);
  }

  // --- USERS ---
  if (path.startsWith('/users/') && method === 'put') {
    const userId = path.replace('/users/', '');
    const updates = parseBody<Partial<User>>(config.data);
    const users = readStore<User[]>(STORAGE_KEYS.users, SEED_USERS);
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      throw new Error('Usuário não encontrado.');
    }
    users[idx] = { ...users[idx], ...updates };
    writeStore(STORAGE_KEYS.users, users);
    return buildResponse(users[idx], config);
  }

  if (path.startsWith('/users/') && path.endsWith('/viewed') && method === 'get') {
    const userId = path.split('/')[2];
    const viewedMap = readStore<Record<string, { opportunityId: string; viewedAt: string }[]>>(
      STORAGE_KEYS.viewed,
      SEED_VIEWED_BY_USER
    );
    return buildResponse(viewedMap[userId] || [], config);
  }

  if (path.startsWith('/users/') && path.endsWith('/viewed') && method === 'post') {
    const userId = path.split('/')[2];
    const { opportunityId } = parseBody<{ opportunityId: string }>(config.data);
    const viewedMap = readStore<Record<string, { opportunityId: string; viewedAt: string }[]>>(
      STORAGE_KEYS.viewed,
      SEED_VIEWED_BY_USER
    );
    const currentList = viewedMap[userId] || [];
    const filtered = currentList.filter((item) => item.opportunityId !== opportunityId);
    viewedMap[userId] = [{ opportunityId, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 12);
    writeStore(STORAGE_KEYS.viewed, viewedMap);
    return buildResponse(viewedMap[userId], config);
  }

  // --- OPPORTUNITIES ---
  if (path === '/opportunities' && method === 'get') {
    const all = readStore<Opportunity[]>(STORAGE_KEYS.opportunities, SEED_OPPORTUNITIES);
    const filters: OpportunityFilters = config.params || {};
    const busca = (filters.busca || params.get('busca') || '').trim().toLowerCase();
    const modalidade = filters.modalidade || (params.get('modalidade') as OpportunityFilters['modalidade']) || 'todas';
    const estado = filters.estado || '';
    const tipoImovel = filters.tipoImovel || '';
    const quartosMin = Number(filters.quartosMin || 0);
    const moradoresMin = Number(filters.moradoresMin || 0);
    const apenasVerificados = Boolean(filters.apenasVerificados);
    const cargo = (filters.cargo || '').trim().toLowerCase();
    const salarioMin = Number(filters.salarioMin || 0);
    const aceitaFilhos = Boolean(filters.aceitaFilhos);
    const aceitaPets = Boolean(filters.aceitaPets);
    const includePaused = Boolean(config.params?.includePaused);
    const ownerId = config.params?.ownerId as string | undefined;

    let result = all.filter((item) => {
      if (!includePaused && item.status !== 'ativo') return false;
      if (ownerId && item.proprietarioId !== ownerId) return false;
      if (modalidade && modalidade !== 'todas' && item.modalidade !== modalidade) return false;
      if (busca) {
        const haystack = `${item.titulo} ${item.resumo} ${item.imovel.cidade} ${item.imovel.estado} ${item.imovel.bairroOuRegiao} ${item.imovel.tipo} ${item.trabalho?.cargo || ''}`.toLowerCase();
        if (!haystack.includes(busca)) return false;
      }
      if (estado && item.imovel.estado !== estado) return false;
      if (tipoImovel && item.imovel.tipo !== tipoImovel) return false;
      if (quartosMin > 0 && item.imovel.quartos < quartosMin) return false;
      if (moradoresMin > 0 && item.imovel.capacidadeMoradores < moradoresMin) return false;
      if (apenasVerificados && !item.verificado) return false;
      if (cargo && !(item.trabalho?.cargo || '').toLowerCase().includes(cargo)) return false;
      if (salarioMin > 0 && (item.trabalho?.salarioMensal || 0) < salarioMin) return false;
      if (aceitaFilhos && !item.imovel.aceitaFilhos) return false;
      if (aceitaPets && !item.imovel.aceitaPets) return false;
      return true;
    });

    const sortBy = filters.ordenacao || 'destaques';
    result = [...result].sort((a, b) => {
      if (sortBy === 'maior_salario') {
        return (b.trabalho?.salarioMensal || 0) - (a.trabalho?.salarioMensal || 0);
      }
      if (sortBy === 'mais_quartos') {
        return b.imovel.quartos - a.imovel.quartos;
      }
      if (sortBy === 'recentes') {
        return b.criadoEm.localeCompare(a.criadoEm);
      }
      if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
      return b.criadoEm.localeCompare(a.criadoEm);
    });

    return buildResponse(result, config);
  }

  if (path.startsWith('/opportunities/') && method === 'get') {
    const id = path.replace('/opportunities/', '');
    const all = readStore<Opportunity[]>(STORAGE_KEYS.opportunities, SEED_OPPORTUNITIES);
    const found = all.find((o) => o.id === id);
    if (!found) {
      throw Object.assign(new Error('Oportunidade não encontrada'), {
        response: { status: 404, data: { message: 'Anúncio não encontrado.' } },
      });
    }
    return buildResponse(found, config);
  }

  if (path === '/opportunities' && method === 'post') {
    const { payload, owner } = parseBody<{ payload: CreateOpportunityPayload; owner: User }>(config.data);
    const all = readStore<Opportunity[]>(STORAGE_KEYS.opportunities, SEED_OPPORTUNITIES);
    const imovelId = `imv-${Date.now()}`;
    const newOpportunity: Opportunity = {
      id: `opt-${Date.now()}`,
      imovelId,
      proprietarioId: owner.id,
      proprietarioNome: owner.nome,
      proprietarioVerificado: owner.verificado,
      proprietarioCidade: `${owner.cidade}, ${owner.estado}`,
      proprietarioAvaliacao: 5.0,
      proprietarioTotalAcordos: 1,
      modalidade: payload.modalidade,
      titulo: payload.titulo,
      resumo: payload.resumo,
      descricaoCompleta: payload.descricaoCompleta,
      disponibilidade: payload.disponibilidade,
      destaque: Boolean(payload.destaque),
      verificado: owner.verificado,
      status: 'ativo',
      criadoEm: new Date().toISOString().slice(0, 10),
      visualizacoes: 1,
      imovel: {
        ...payload.imovel,
        id: imovelId,
        proprietarioId: owner.id,
      },
      trabalho: payload.modalidade === 'trabalho' ? payload.trabalho : undefined,
      ocupacao: payload.modalidade === 'ocupacao' ? payload.ocupacao : undefined,
    };
    const updated = [newOpportunity, ...all];
    writeStore(STORAGE_KEYS.opportunities, updated);
    return buildResponse(newOpportunity, config, 201);
  }

  if (path.startsWith('/opportunities/') && method === 'put') {
    const id = path.replace('/opportunities/', '');
    const updates = parseBody<Partial<Opportunity>>(config.data);
    const all = readStore<Opportunity[]>(STORAGE_KEYS.opportunities, SEED_OPPORTUNITIES);
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Anúncio não encontrado.');
    all[idx] = {
      ...all[idx],
      ...updates,
      imovel: updates.imovel ? { ...all[idx].imovel, ...updates.imovel } : all[idx].imovel,
    };
    writeStore(STORAGE_KEYS.opportunities, all);
    return buildResponse(all[idx], config);
  }

  if (path.startsWith('/opportunities/') && method === 'delete') {
    const id = path.replace('/opportunities/', '');
    const all = readStore<Opportunity[]>(STORAGE_KEYS.opportunities, SEED_OPPORTUNITIES);
    const filtered = all.filter((o) => o.id !== id);
    writeStore(STORAGE_KEYS.opportunities, filtered);
    return buildResponse({ deleted: true, id }, config);
  }

  // --- FAVORITES ---
  if (path.startsWith('/favorites/') && method === 'get') {
    const userId = path.replace('/favorites/', '');
    const favMap = readStore<Record<string, string[]>>(STORAGE_KEYS.favorites, SEED_FAVORITES_BY_USER);
    return buildResponse(favMap[userId] || [], config);
  }

  if (path === '/favorites/toggle' && method === 'post') {
    const { userId, opportunityId } = parseBody<{ userId: string; opportunityId: string }>(config.data);
    const favMap = readStore<Record<string, string[]>>(STORAGE_KEYS.favorites, SEED_FAVORITES_BY_USER);
    const current = favMap[userId] || [];
    const exists = current.includes(opportunityId);
    const updatedList = exists
      ? current.filter((id) => id !== opportunityId)
      : [opportunityId, ...current];
    favMap[userId] = updatedList;
    writeStore(STORAGE_KEYS.favorites, favMap);
    return buildResponse({ favorites: updatedList, favorited: !exists }, config);
  }

  // --- APPLICATIONS ---
  if (path === '/applications' && method === 'get') {
    const all = readStore<Application[]>(STORAGE_KEYS.applications, SEED_APPLICATIONS);
    const seekerId = config.params?.seekerId as string | undefined;
    const ownerId = config.params?.ownerId as string | undefined;
    const filtered = all.filter((app) => {
      if (seekerId && app.interessadoId !== seekerId) return false;
      if (ownerId && app.proprietarioId !== ownerId) return false;
      return true;
    });
    return buildResponse(filtered, config);
  }

  if (path === '/applications' && method === 'post') {
    const payload = parseBody<{
      opportunity: Opportunity;
      seeker: User;
      mensagem: string;
      disponibilidadeInicio: string;
    }>(config.data);
    const all = readStore<Application[]>(STORAGE_KEYS.applications, SEED_APPLICATIONS);
    const alreadyApplied = all.find(
      (a) => a.oportunidadeId === payload.opportunity.id && a.interessadoId === payload.seeker.id
    );
    if (alreadyApplied) {
      return buildResponse(alreadyApplied, config);
    }
    const now = new Date().toISOString();
    const created: Application = {
      id: `app-${Date.now()}`,
      oportunidadeId: payload.opportunity.id,
      oportunidadeTitulo: payload.opportunity.titulo,
      oportunidadeCidade: `${payload.opportunity.imovel.cidade}, ${payload.opportunity.imovel.estado}`,
      oportunidadeImagem: payload.opportunity.imovel.imagens[0],
      modalidade: payload.opportunity.modalidade,
      interessadoId: payload.seeker.id,
      interessadoNome: payload.seeker.nome,
      interessadoCidade: `${payload.seeker.cidade}, ${payload.seeker.estado}`,
      interessadoTelefone: payload.seeker.telefone,
      interessadoHabilidades: payload.seeker.habilidades || [],
      interessadoMoradores: payload.seeker.moradores || 1,
      proprietarioId: payload.opportunity.proprietarioId,
      proprietarioNome: payload.opportunity.proprietarioNome,
      mensagem: payload.mensagem,
      disponibilidadeInicio: payload.disponibilidadeInicio,
      status: 'enviada',
      criadaEm: now,
      atualizadaEm: now,
    };
    const updated = [created, ...all];
    writeStore(STORAGE_KEYS.applications, updated);
    return buildResponse(created, config, 201);
  }

  if (path.startsWith('/applications/') && method === 'patch') {
    const id = path.replace('/applications/', '');
    const { status } = parseBody<{ status: ApplicationStatus }>(config.data);
    const all = readStore<Application[]>(STORAGE_KEYS.applications, SEED_APPLICATIONS);
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Candidatura não encontrada.');
    all[idx] = {
      ...all[idx],
      status,
      atualizadaEm: new Date().toISOString(),
    };
    writeStore(STORAGE_KEYS.applications, all);
    return buildResponse(all[idx], config);
  }

  if (path.startsWith('/applications/') && method === 'delete') {
    const id = path.replace('/applications/', '');
    const all = readStore<Application[]>(STORAGE_KEYS.applications, SEED_APPLICATIONS);
    const filtered = all.filter((a) => a.id !== id);
    writeStore(STORAGE_KEYS.applications, filtered);
    return buildResponse({ deleted: true }, config);
  }

  // --- CHAT ---
  if (path === '/conversations' && method === 'get') {
    const userId = config.params?.userId as string;
    const all = readStore<Conversation[]>(STORAGE_KEYS.conversations, SEED_CONVERSATIONS);
    const filtered = all
      .filter((c) => c.proprietarioId === userId || c.interessadoId === userId)
      .sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm));
    return buildResponse(filtered, config);
  }

  if (path === '/conversations/ensure' && method === 'post') {
    const { opportunity, seeker } = parseBody<{ opportunity: Opportunity; seeker: User }>(config.data);
    const all = readStore<Conversation[]>(STORAGE_KEYS.conversations, SEED_CONVERSATIONS);
    const existing = all.find(
      (c) => c.oportunidadeId === opportunity.id && c.interessadoId === seeker.id
    );
    if (existing) return buildResponse(existing, config);

    const now = new Date().toISOString();
    const convId = `conv-${Date.now()}`;
    const created: Conversation = {
      id: convId,
      oportunidadeId: opportunity.id,
      oportunidadeTitulo: opportunity.titulo,
      oportunidadeImagem: opportunity.imovel.imagens[0],
      modalidade: opportunity.modalidade,
      proprietarioId: opportunity.proprietarioId,
      proprietarioNome: opportunity.proprietarioNome,
      interessadoId: seeker.id,
      interessadoNome: seeker.nome,
      naoLidasParaProprietario: 0,
      naoLidasParaInteressado: 0,
      atualizadaEm: now,
      mensagens: [
        {
          id: `msg-${Date.now()}`,
          conversaId: convId,
          remetenteId: seeker.id,
          remetenteNome: seeker.nome,
          texto: `Olá ${opportunity.proprietarioNome}, tenho interesse na oportunidade "${opportunity.titulo}" em ${opportunity.imovel.cidade}. Podemos conversar sobre as condições?`,
          enviadaEm: now,
        },
      ],
    };
    const updated = [created, ...all];
    writeStore(STORAGE_KEYS.conversations, updated);
    return buildResponse(created, config, 201);
  }

  if (path.endsWith('/messages') && method === 'post') {
    const convId = path.split('/')[2];
    const { senderId, senderName, text } = parseBody<{
      senderId: string;
      senderName: string;
      text: string;
    }>(config.data);
    const all = readStore<Conversation[]>(STORAGE_KEYS.conversations, SEED_CONVERSATIONS);
    const idx = all.findIndex((c) => c.id === convId);
    if (idx === -1) throw new Error('Conversa não encontrada.');

    const now = new Date().toISOString();
    const msg = {
      id: `msg-${Date.now()}`,
      conversaId: convId,
      remetenteId: senderId,
      remetenteNome: senderName,
      texto: text,
      enviadaEm: now,
    };
    const conv = all[idx];
    const isOwnerSender = senderId === conv.proprietarioId;
    all[idx] = {
      ...conv,
      mensagens: [...conv.mensagens, msg],
      atualizadaEm: now,
      naoLidasParaInteressado: isOwnerSender ? conv.naoLidasParaInteressado + 1 : 0,
      naoLidasParaProprietario: isOwnerSender ? 0 : conv.naoLidasParaProprietario + 1,
    };
    writeStore(STORAGE_KEYS.conversations, all);
    return buildResponse(all[idx], config, 201);
  }

  if (path.endsWith('/read') && method === 'patch') {
    const convId = path.split('/')[2];
    const { userId } = parseBody<{ userId: string }>(config.data);
    const all = readStore<Conversation[]>(STORAGE_KEYS.conversations, SEED_CONVERSATIONS);
    const idx = all.findIndex((c) => c.id === convId);
    if (idx !== -1) {
      if (all[idx].proprietarioId === userId) all[idx].naoLidasParaProprietario = 0;
      if (all[idx].interessadoId === userId) all[idx].naoLidasParaInteressado = 0;
      writeStore(STORAGE_KEYS.conversations, all);
      return buildResponse(all[idx], config);
    }
    return buildResponse(null, config);
  }

  throw new Error(`Endpoint não mapeado no mock adapter: ${method.toUpperCase()} ${path}`);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Custom Axios adapter for local MVP simulation backed by localStorage.
  // To connect a real REST API in production, simply remove this adapter property.
  adapter: mockAxiosAdapter,
});

export function resetDemoData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
