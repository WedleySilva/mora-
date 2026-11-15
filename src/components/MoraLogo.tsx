interface MoraLogoProps {
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

/**
 * Logo oficial Mora+ adaptada conforme especificação:
 * todo o verde original substituído por azul-escuro (#123F52),
 * mantendo o laranja original (#F59A16).
 */
export function MoraLogo({
  variant = 'default',
  size = 'md',
  showSlogan = false,
}: MoraLogoProps) {
  const primaryColor = variant === 'light' ? '#FFFFFF' : '#123F52';
  const accentColor = '#F59A16';

  const dimensions =
    size === 'sm'
      ? { icon: 30, textClass: 'text-xl', sloganClass: 'text-[10px]' }
      : size === 'lg'
      ? { icon: 46, textClass: 'text-3xl', sloganClass: 'text-xs' }
      : { icon: 36, textClass: 'text-2xl', sloganClass: 'text-[11px]' };

  return (
    <div className="inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0">
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 64 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Telhado da casa com chaminé em azul-escuro (#123F52) */}
        <path
          d="M8 27L30.5 9.5C31.4 8.8 32.6 8.8 33.5 9.5L43 16.9V12.2C43 11 44 10 45.2 10H48.8C50 10 51 11 51 12.2V23.1L56 27"
          stroke={primaryColor}
          strokeWidth="5.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Janela 2x2 em azul-escuro */}
        <rect x="24" y="21.5" width="7" height="6.5" rx="1.2" fill={primaryColor} />
        <rect x="33" y="21.5" width="7" height="6.5" rx="1.2" fill={primaryColor} />
        <rect x="24" y="29.8" width="7" height="6.5" rx="1.2" fill={primaryColor} />
        <rect x="33" y="29.8" width="7" height="6.5" rx="1.2" fill={primaryColor} />
        {/* Arco acolhedor (sorriso) em laranja original (#F59A16) */}
        <path
          d="M15.5 34.5C18.5 46.2 28.5 52.5 38.5 49.5C44.5 47.7 49 43.2 51.2 37.2"
          stroke={accentColor}
          strokeWidth="5.8"
          strokeLinecap="round"
        />
        {/* Sinal de + em laranja original (#F59A16) */}
        <path
          d="M54 27.5V39.5M48 33.5H60"
          stroke={accentColor}
          strokeWidth="4.8"
          strokeLinecap="round"
        />
      </svg>

      <div className="flex flex-col leading-none">
        <span className={`font-display font-extrabold tracking-tight ${dimensions.textClass}`}>
          <span style={{ color: primaryColor }}>Mora</span>
          <span style={{ color: accentColor }}>+</span>
        </span>
        {showSlogan && (
          <span
            className={`mt-1 font-medium ${dimensions.sloganClass}`}
            style={{ color: variant === 'light' ? 'rgba(255,255,255,0.78)' : '#737B80' }}
          >
            Transformando imóveis vazios em novos lares.
          </span>
        )}
      </div>
    </div>
  );
}
