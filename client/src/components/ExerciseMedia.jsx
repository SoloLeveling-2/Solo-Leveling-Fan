import {
    exerciseImageAlt,
    imageSearchUrl,
    youtubeEmbedUrl,
    youtubeSearchUrl,
    youtubeThumbnailUrl
} from '../lib/media.js';

function MissingMedia({ exercise, compact }) {
    const tutorialQuery = exercise.youtubeQuery || `beginner ${exercise.name} exercise form tutorial`;
    const imageQuery = `${exercise.name} beginner exercise form picture`;

    return (
        <div className="media-placeholder" role="note">
            <div className="media-placeholder-icon" aria-hidden="true">▶</div>
            <div>
                <strong>No media added yet</strong>
                <p>
                    {compact
                        ? 'Use the tutorial links below for a safe beginner demo.'
                        : `Add a YouTube URL or image URL for ${exercise.name}, or use these searches for a safe beginner demo.`}
                </p>
                <div className="media-actions">
                    <a href={youtubeSearchUrl(tutorialQuery)} target="_blank" rel="noreferrer">Find YouTube demo</a>
                    <a href={imageSearchUrl(imageQuery)} target="_blank" rel="noreferrer">Find image preview</a>
                </div>
            </div>
        </div>
    );
}

export default function ExerciseMedia({ exercise, compact = false, showImage = true }) {
    if (!exercise) return null;

    const embed = youtubeEmbedUrl(exercise.videoUrl);
    const thumbnail = youtubeThumbnailUrl(exercise.videoUrl);
    const hasImage = Boolean(exercise.imageUrl);

    return (
        <div className={`exercise-media${compact ? ' compact' : ''}`}>
            <section className="media-section" aria-label={`${exercise.name} video demonstration`}>
                <div className="media-section-heading">
                    <h5>Video demo</h5>
                    {thumbnail && <img src={thumbnail} alt="" aria-hidden="true" className="youtube-thumb" />}
                </div>
                {embed ? (
                    <div className="video-frame">
                        <iframe
                            title={`${exercise.name} video demonstration`}
                            src={embed}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <MissingMedia exercise={exercise} compact={compact} />
                )}
            </section>

            {showImage && (
                <section className="media-section" aria-label={`${exercise.name} picture preview`}>
                    <h5>Picture preview</h5>
                    {hasImage ? (
                        <figure className="image-preview">
                            <img src={exercise.imageUrl} alt={exerciseImageAlt(exercise)} loading="lazy" />
                            <figcaption>{exercise.imageCaption || 'Use this image as a quick form reference before each set.'}</figcaption>
                        </figure>
                    ) : (
                        <div className="media-placeholder image-missing" role="note">
                            <div className="media-placeholder-icon" aria-hidden="true">◇</div>
                            <div>
                                <strong>No image preview yet</strong>
                                <p>Paste an image URL on the Exercises page to show a form preview here.</p>
                                <a href={imageSearchUrl(`${exercise.name} beginner exercise form picture`)} target="_blank" rel="noreferrer">Search picture examples</a>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
