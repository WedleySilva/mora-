import heroHomestead from '../assets/images/hero_brazilian_homestead_1794676930993.jpg';
import chacaraAtibaia from '../assets/images/prop_chacara_atibaia_1794676930753.jpg';
import casaCampinas from '../assets/images/prop_casa_campinas_1794676931232.jpg';
import sitioMinas from '../assets/images/prop_sitio_minas_1794676931897.jpg';
import temporadaLitoral from '../assets/images/prop_temporada_litoral_1794676932021.jpg';
import fazendaHorta from '../assets/images/prop_fazenda_horta_1794676932258.jpg';
import sobradoCuritiba from '../assets/images/prop_sobrado_curitiba_1794676933619.jpg';
import casaSerra from '../assets/images/prop_casa_serra_1794676932794.jpg';

export const PROPERTY_IMAGES = {
  heroHomestead,
  chacaraAtibaia,
  casaCampinas,
  sitioMinas,
  temporadaLitoral,
  fazendaHorta,
  sobradoCuritiba,
  casaSerra,
};

export interface PresetPhotoOption {
  id: string;
  label: string;
  url: string;
}

export const PRESET_PROPERTY_PHOTOS: PresetPhotoOption[] = [
  { id: 'chacara', label: 'Chácara com piscina e gramado', url: chacaraAtibaia },
  { id: 'casa-urbana', label: 'Casa térrea urbana com jardim', url: casaCampinas },
  { id: 'sitio', label: 'Sítio com horta e varanda', url: sitioMinas },
  { id: 'temporada', label: 'Casa de temporada com deck', url: temporadaLitoral },
  { id: 'fazenda', label: 'Propriedade rural com casa de caseiro', url: fazendaHorta },
  { id: 'sobrado', label: 'Sobrado residencial arborizado', url: sobradoCuritiba },
  { id: 'serra', label: 'Casa de campo na serra', url: casaSerra },
  { id: 'varanda', label: 'Casa com varanda rústica', url: heroHomestead },
];
