export function KDramaYoutubeLessonFeature() {
  return (
    <div className="k-drama-feature k-drama-feature--youtube" aria-hidden="true">
      <div className="k-drama-feature__youtube-box k-drama-feature__youtube-box--url">
        <small className="k-drama-feature__url-heading">URL EMBED</small>
        <strong className="k-drama-feature__url-description">
          Paste the YouTube link you want to study.
        </strong>
        <div className="k-drama-feature__url-input">
          <span className="k-drama-feature__youtube-mark">▶</span>
          <span className="k-drama-feature__url-value">youtube.com/shorts/k-drama</span>
        </div>
        <span className="k-drama-feature__url-submit">Create lesson</span>
      </div>
      <div className="k-drama-feature__youtube-box k-drama-feature__youtube-box--progress">
        <img className="k-drama-feature__download-image" src="/images/image-2.png" alt="" />
        <div className="k-drama-feature__download-overlay">
          <div className="k-drama-feature__lesson-progress">
            <div className="k-drama-feature__download-core">
              <span className="k-drama-feature__youtube-mark">▶</span>
            </div>
          </div>
        </div>
      </div>
      <div className="k-drama-feature__youtube-box k-drama-feature__youtube-box--lesson">
        <div className="k-drama-feature__lesson-skeleton">
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="k-drama-feature__lesson-chip">K-drama</span>
        <div className="k-drama-feature__lesson-scene" />
        <strong>무궁화 꽃이 피었습니다</strong>
        <small className="k-drama-feature__lesson-romanization">
          Mugunghwa kkochi pieotseumnida
        </small>
        <div className="k-drama-feature__lesson-lines">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="k-drama-feature__youtube-box k-drama-feature__youtube-box--library">
        <div className="k-drama-feature__library-header">
          <strong>Save lessons</strong>
          <span>전체보기 &gt;</span>
        </div>
        <div className="k-drama-feature__saved-cards">
          <div className="k-drama-feature__saved-card">
            <img src="/images/image-2.png" alt="" />
            <div className="k-drama-feature__saved-skeleton">
              <span />
              <span />
              <span />
            </div>
            <div className="k-drama-feature__saved-overlay">
              <div className="k-drama-feature__saved-heading">
                <strong>Squid Game</strong>
                <span>🔥 4회 들음</span>
              </div>
              <div className="k-drama-feature__saved-caption">
                <strong>무궁화 꽃이 피었습니다</strong>
                <small>Mugunghwa kkochi pieotseumnida</small>
                <div>
                  <i>무궁화</i>
                  <i>꽃이</i>
                  <i>피었습니다</i>
                </div>
              </div>
            </div>
          </div>
          <div className="k-drama-feature__saved-card">
            <img src="/images/image-3.png" alt="" />
            <div className="k-drama-feature__saved-overlay">
              <div className="k-drama-feature__saved-heading">
                <strong>BTS · Butter</strong>
                <span>🔥 7회 들음</span>
              </div>
              <div className="k-drama-feature__saved-caption">
                <strong>오늘 무대 최고였어</strong>
                <small>Oneul mudae choegoyeosseo</small>
                <div>
                  <i>오늘</i>
                  <i>무대</i>
                  <i>최고였어</i>
                </div>
              </div>
            </div>
          </div>
          <div className="k-drama-feature__saved-card">
            <img src="/images/image-7.png" alt="" />
            <div className="k-drama-feature__saved-overlay">
              <div className="k-drama-feature__saved-heading">
                <strong>Weak Hero</strong>
                <span>🔥 3회 들음</span>
              </div>
              <div className="k-drama-feature__saved-caption">
                <strong>끝까지 포기하지 마</strong>
                <small>Kkeutkkaji pogihaji ma</small>
                <div>
                  <i>끝까지</i>
                  <i>포기하지</i>
                  <i>마</i>
                </div>
              </div>
            </div>
          </div>
          <div className="k-drama-feature__saved-card">
            <img src="/images/image-8.png" alt="" />
            <div className="k-drama-feature__saved-overlay">
              <div className="k-drama-feature__saved-heading">
                <strong>Daily Korean</strong>
                <span>🔥 5회 들음</span>
              </div>
              <div className="k-drama-feature__saved-caption">
                <strong>오늘도 좋은 하루 보내세요</strong>
                <small>Oneuldo joeun haru bonaeseyo</small>
                <div>
                  <i>오늘도</i>
                  <i>좋은 하루</i>
                  <i>보내세요</i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
