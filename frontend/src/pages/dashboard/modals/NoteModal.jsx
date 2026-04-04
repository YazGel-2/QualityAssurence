import React, { useState, useEffect } from 'react';

const NoteModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{initialData ? 'Notu Düzenle' : 'Yeni Not Ekle'}</h3>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Not Başlığı"
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Notunuzu buraya yazın..."
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="5"
          />
          
          <div style={styles.buttonContainer}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              İptal
            </button>
            <button type="submit" style={styles.saveBtn}>
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#111827',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    padding: '10px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  saveBtn: {
    padding: '10px 16px',
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  }
};

export default NoteModal;