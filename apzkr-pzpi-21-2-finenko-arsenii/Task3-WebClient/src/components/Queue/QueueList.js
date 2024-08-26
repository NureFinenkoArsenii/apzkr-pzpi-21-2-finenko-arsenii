import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/Queue/QueueList.scss';

function QueueList({ stages, currentStage }) {
    const { t } = useTranslation();

    return (
        <div className="queue-tab">
            <h2>{t('queue')}</h2>
            <ul className="queue-list">
                {stages.map((stage, index) => (
                    <li key={index} className={currentStage === index ? 'active' : ''}>
                        {t(stage.name)} {/* Використовуємо ключі перекладу для відображення назв етапів */}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default QueueList;