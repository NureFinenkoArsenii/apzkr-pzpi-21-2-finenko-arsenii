import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import CanvasDraw from "react-canvas-draw";
import html2canvas from "html2canvas";
import "../../styles/InteractionColumn/DrawingBoard.scss"; // Імпорт стилів
import SaveDrawingDialog from "./SaveDrawingDialog"; // Імпорт нового компонента

const DrawingBoard = ({ onExit }) => {
  const { t } = useTranslation(); // Ініціалізація перекладу
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(4);
  const [showSaveDialog, setShowSaveDialog] = useState(false); // Додаємо стан для діалогового вікна
  const [controlsVisible, setControlsVisible] = useState(true); // Додаємо стан для контролів
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleWheel = (event) => {
      if (event.deltaY < 0) {
        setBrushRadius((prev) => Math.min(prev + 1, 20)); // Збільшуємо радіус
      } else {
        setBrushRadius((prev) => Math.max(prev - 1, 1)); // Зменшуємо радіус
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.code === "KeyZ") {
        handleUndo();
      }
      if (event.ctrlKey && event.code === "KeyC") { // Обробка Ctrl+C
        handleCopyToClipboard(); // Виклик функції копіювання до буфера обміну
      }
      if (event.key === "Escape") {
        onExit(); // Викликати функцію виходу при натисканні Escape
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true); // Відкриваємо діалогове вікно для збереження
  };

  const handleCloseDialog = () => {
    setShowSaveDialog(false); // Закриваємо діалогове вікно
    setControlsVisible(true); // Повертаємо контролі після збереження
  };

  const handleBeforeSave = () => {
    setControlsVisible(false); // Приховуємо контролі
    setTimeout(() => {
      setShowSaveDialog(false); // Закриваємо діалог
    }, 100); // Додаємо невелике затримання перед збереженням
  };

  const handleCopyToClipboard = () => {
    const element = document.querySelector(".app");

    if (element) {
      setControlsVisible(false); // Приховуємо контролі перед захопленням
      setTimeout(() => {
        html2canvas(element, { useCORS: true }).then((canvas) => {
          canvas.toBlob((blob) => {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]).then(() => {
              console.log(t('image_copied_to_clipboard'));
              setControlsVisible(true); // Повертаємо контролі після копіювання
            }).catch((error) => {
              console.error(t('image_copy_failed'), error);
              setControlsVisible(true); // Повертаємо контролі в разі помилки
            });
          });
        }).catch((error) => {
          console.error(t('image_capture_failed'), error);
          setControlsVisible(true); // Повертаємо контролі в разі помилки
        });
      }, 1700); // Додаємо затримку перед копіюванням
    } else {
      console.error(t('app_element_not_found'));
    }
  };

  return (
    <div className="drawing-board">
      <CanvasDraw
        ref={canvasRef}
        brushColor={brushColor}
        brushRadius={brushRadius}
        lazyRadius={0}
        canvasWidth={window.innerWidth}
        canvasHeight={window.innerHeight}
        hideGrid={true}
        style={{
          backgroundColor: "transparent",
        }}
      />
      {controlsVisible && (
        <div className="controls">
          <label>
            {t('color')}:
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
            />
          </label>
          <label>
            {t('brush_radius')}: {brushRadius}
          </label>
          <button onClick={handleUndo}>{t('undo')}</button>
          <button onClick={handleSave}>{t('save')}</button> {/* Додаємо кнопку Save */}
          <button onClick={onExit}>{t('exit')}</button>
        </div>
      )}

      {showSaveDialog && (
        <SaveDrawingDialog
          onClose={handleCloseDialog}
          onBeforeSave={handleBeforeSave}
          handleCopyToClipboard={handleCopyToClipboard} // Передаємо функцію до SaveDrawingDialog
        /> 
      )}
    </div>
  );
};

export default DrawingBoard;
