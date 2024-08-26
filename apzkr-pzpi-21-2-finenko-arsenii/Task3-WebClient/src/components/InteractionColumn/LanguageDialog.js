import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/InteractionColumn/LanguageDialog.scss';

const LanguageDialog = ({ onClose }) => {
    const { i18n, t } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);

    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage);
        i18n.changeLanguage(newLanguage);
    };

    return (
        <div className="language-dialog-overlay" onClick={onClose}>
            <div className="language-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="language-dialog-content">
                    <h2>{t('choose_language')}</h2>
                    <div className="language-selector">
                        <label>
                            <input
                                type="radio"
                                value="en"
                                checked={language === 'en'}
                                onChange={handleLanguageChange}
                            />
                            English
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="ua"
                                checked={language === 'ua'}
                                onChange={handleLanguageChange}
                            />
                            Українська
                        </label>
                    </div>
                    <button onClick={onClose}>{t('close')}</button>
                </div>
            </div>
        </div>
    );
};

export default LanguageDialog;