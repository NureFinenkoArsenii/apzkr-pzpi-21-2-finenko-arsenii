import React from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf"; // Імпорт jsPDF для створення PDF
import "../../styles/InteractionColumn/SaveDrawingDialog.scss"; // Імпорт стилів для діалогового вікна

const SaveDrawingDialog = ({ onClose, onBeforeSave, clipboardTriggerRef }) => {
  const { t } = useTranslation(); // Ініціалізація перекладу

  const handleSaveAsJPEG = () => {
    onBeforeSave(); // Виклик функції для приховування контролів та закриття діалогу

    const element = document.querySelector(".app");

    if (element) {  // Перевірка наявності елемента
      setTimeout(() => {  // Додаємо затримку перед захопленням зображення
        html2canvas(element, { useCORS: true }).then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/jpeg");
          link.download = "screenshot.jpeg";
          link.click();
          onClose(); // Закриває діалогове вікно після збереження
        });
      }, 1700); // Затримка в 1.7 секунди перед збереженням зображення
    } else {
      console.error(t("drawing_board_not_found"));
    }
  };

  const handleSaveAsPDF = () => {
    onBeforeSave(); // Виклик функції для приховування контролів та закриття діалогу

    const element = document.querySelector(".app");

    if (element) {
      setTimeout(() => {
        html2canvas(element, { useCORS: true }).then((canvas) => {
          const imgData = canvas.toDataURL("image/jpeg");
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
          pdf.save("screenshot.pdf");
          onClose(); // Закриває діалогове вікно після збереження
        });
      }, 1700); // Додаємо затримку перед збереженням PDF
    } else {
      console.error(t("drawing_board_not_found"));
    }
  };

  const handleCopyToClipboard = () => {
    onBeforeSave(); // Виклик функції для приховування контролів та закриття діалогу

    const element = document.querySelector(".app");

    if (element) {
      setTimeout(() => {
        html2canvas(element, { useCORS: true }).then((canvas) => {
          canvas.toBlob((blob) => {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]).then(() => {
              console.log(t("image_copied_to_clipboard"));
              onClose(); // Закриває діалогове вікно після збереження
            }).catch((error) => {
              console.error(t("image_copy_failed"), error);
            });
          });
        }).catch((error) => {
          console.error(t("image_capture_failed"), error);
        });
      }, 1700); // Додаємо затримку перед копіюванням
    } else {
      console.error(t("app_element_not_found"));
    }
  };

  return (
    <div className="save-drawing-dialog-unique">
      <h2>{t("how_to_save")}</h2>
      <div className="save-options-unique">
        <button onClick={handleSaveAsJPEG}>JPEG</button>
        <button onClick={handleSaveAsPDF}>PDF</button>
        <button onClick={handleCopyToClipboard} ref={clipboardTriggerRef}>{t("clipboard")}</button> {/* Додаємо реф для автоматичного натискання */}
      </div>
      <button className="cancel-button-unique" onClick={onClose}>
        {t("cancel")}
      </button>
    </div>
  );
};

export default SaveDrawingDialog;