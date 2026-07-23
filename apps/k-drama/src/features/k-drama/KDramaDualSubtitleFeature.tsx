interface ShadowingPhoneContentProps {
  imageSrc: string;
  captionWords: readonly string[];
  romanizationWords: readonly string[];
}

function ShadowingPhoneContent({
  imageSrc,
  captionWords,
  romanizationWords,
}: ShadowingPhoneContentProps) {
  return (
    <div className="k-drama-feature__phone-content">
      <div className="k-drama-feature__phone-header">
        <strong>오징어 게임1: Squid Game 2</strong>
        <span>🔥 연속 챌린지 2회 달성</span>
      </div>
      <div className="k-drama-feature__scene k-drama-feature__scene--night">
        <img src={imageSrc} alt="" />
        <div className="k-drama-feature__scene-caption">
          <strong>
            {captionWords.map((word) => (
              <span key={word}>{word} </span>
            ))}
          </strong>
          <span className="k-drama-feature__romanization">
            {romanizationWords.map((word) => (
              <i key={word}>{word} </i>
            ))}
          </span>
          <div className="k-drama-feature__scene-words">
            {captionWords.map((word) => (
              <i key={word}>{word}</i>
            ))}
          </div>
        </div>
        <div className="k-drama-feature__player-controls">
          <div className="k-drama-feature__player-time">
            <span>0:14</span>
            <span>0:42</span>
          </div>
          <div className="k-drama-feature__player-progress" />
          <div className="k-drama-feature__player-actions">
            <span className="is-active" title="다시 재생">
              ↻
            </span>
            <span title="뒤로 가기">
              <i className="k-drama-feature__rewind-icon" />
            </span>
            <span title="중지">■</span>
            <span title="재생">▶</span>
            <span className="is-active" title="챌린지">
              <svg className="k-drama-feature__challenge-icon" viewBox="0 0 24 24">
                <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
                <path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 12v4M9 20h6M10 16h4" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KDramaDualSubtitleFeature() {
  return (
    <div className="k-drama-feature k-drama-feature--subtitles" aria-hidden="true">
      <div className="k-drama-feature__phone k-drama-feature__phone--secondary">
        <ShadowingPhoneContent
          imageSrc="/images/image-3.png"
          captionWords={["Smooth", "like", "butter"]}
          romanizationWords={["스무스", "라이크", "버터"]}
        />
      </div>
      <div className="k-drama-feature__side-actions">
        <span>
          <svg viewBox="0 0 24 24">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 24 24">
            <path d="M6 9a6 6 0 1 1 12 0c0 5-5 4-5 9a3 3 0 0 1-6 0M10 9a2 2 0 0 1 4 0c0 2-2 2-2 4" />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 24 24">
            <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z" />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 24 24">
            <path d="M7 10v11H3V10h4ZM7 19h10a2 2 0 0 0 2-1.7l1-6A2 2 0 0 0 18 9h-4l1-4-2-2-6 7" />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 24 24">
            <path d="M7 14V3H3v11h4ZM7 5h10a2 2 0 0 1 2 1.7l1 6A2 2 0 0 1 18 15h-4l1 4-2 2-6-7" />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 24 24">
            <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8M4 3v5h5" />
          </svg>
        </span>
      </div>
      <div className="k-drama-feature__phone k-drama-feature__phone--primary">
        <ShadowingPhoneContent
          imageSrc="/images/image-2.png"
          captionWords={["무궁화", "꽃이", "피었습니다"]}
          romanizationWords={["Mugunghwa", "kkochi", "pieotseumnida"]}
        />
      </div>
    </div>
  );
}
