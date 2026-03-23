import { useState } from "react";

export default function UploaderModal({ onClose, onDemo, onFile }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="uploader-modal" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="uploader-card">
        <div className="uploader-card__header">
          <div>
            <p className="eyebrow">Incident Tracking</p>
            <h3>Cargar archivo Excel</h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">X</button>
        </div>
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (event.currentTarget === event.target) {
              setIsDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) onFile(file);
          }}
        >
          <div className="dropzone__content">
            <div className="dropzone__illustration" aria-hidden="true">
              <span className="dropzone__orb" />
              <span className="dropzone__icon">
                <span className="dropzone__arrow" />
              </span>
            </div>
            <p>Arrastra tu Excel aqui o selecciona un archivo</p>
            <small>Columnas esperadas: id, ticket, subject, application, module, classification, technician, priority, status, description, solution, created_date, last_updated_date</small>
          </div>
          <label className="dropzone__action">
            <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
            <span className="primary-button">Seleccionar archivo</span>
          </label>
        </div>
        <div className="uploader-card__actions">
          <button className="ghost-button" onClick={onDemo}>Usar dataset demo</button>
        </div>
      </div>
    </div>
  );
}
