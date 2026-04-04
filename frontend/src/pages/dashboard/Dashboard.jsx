import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotesApi,
  createNoteApi,
  updateNoteApi,
  deleteNoteApi,
  getAllUsersApi,
  deleteUserApi,
} from "../../api";
import NoteModal from "./modals/NoteModal";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const isAdmin = currentUser?.role === "admin";

  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = parseJwt(token);
      setCurrentUser(decodedUser);
    }

    if (activeTab === "notes") {
      fetchNotes();
    } else if (activeTab === "users" && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await getMyNotesApi();
      setNotes(response.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsersApi();
      setUsers(response.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // --- NOT İŞLEMLERİ ---
  const handleSaveNote = async (noteData) => {
    try {
      if (selectedNote) {
        await updateNoteApi(selectedNote.id, noteData);
      } else {
        await createNoteApi(noteData);
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Bu notu silmek istediğinize emin misiniz?")) {
      try {
        await deleteNoteApi(noteId);
        fetchNotes();
      } catch (err) {
        alert("Hata: " + err.message);
      }
    }
  };

  const openModalForCreate = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  // --- KULLANICI İŞLEMLERİ ---
  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.userId) {
      return alert("Kendinizi silemezsiniz!");
    }
    if (window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      try {
        await deleteUserApi(userId);
        fetchUsers();
      } catch (err) {
        alert("Hata: " + err.message);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Hoş Geldin 👋</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Çıkış Yap
        </button>
      </div>

      <div style={styles.content}>
        {/* TAB MENÜSÜ (Sadece Admin görebilir) */}
        {isAdmin && (
          <div style={styles.tabContainer}>
            <button
              style={activeTab === "notes" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("notes")}
            >
              Notlarım
            </button>
            <button
              style={activeTab === "users" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("users")}
            >
              Kullanıcı Yönetimi
            </button>
          </div>
        )}

        {/* NOTLAR SEKMESİ */}
        {activeTab === "notes" && (
          <>
            <div style={styles.contentHeader}>
              <h3 style={styles.subTitle}>Notlarım</h3>
              <button onClick={openModalForCreate} style={styles.addBtn}>
                + Yeni Not Ekle
              </button>
            </div>

            {loading ? (
              <p>Yükleniyor...</p>
            ) : notes.length === 0 ? (
              <p style={styles.emptyText}>Henüz hiç notun yok.</p>
            ) : (
              <div style={styles.grid}>
                {notes.map((note) => (
                  <div key={note.id} style={styles.card}>
                    <h4 style={styles.cardTitle}>{note.title}</h4>
                    <p style={styles.cardContent}>{note.content}</p>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => openModalForEdit(note)}
                        style={styles.editBtn}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        style={styles.deleteBtn}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* KULLANICILAR SEKMESİ (Sadece Admin) */}
        {activeTab === "users" && isAdmin && (
          <>
            <div style={styles.contentHeader}>
              <h3 style={styles.subTitle}>Sistem Kullanıcıları</h3>
            </div>

            {loading ? (
              <p>Yükleniyor...</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Kullanıcı Adı</th>
                      <th style={styles.th}>Rol</th>
                      <th style={styles.th}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}>{u.id}</td>
                        <td style={styles.td}>{u.username}</td>
                        <td style={styles.td}>
                          <span
                            style={
                              u.role === "admin"
                                ? styles.badgeAdmin
                                : styles.badgeUser
                            }
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {u.id !== currentUser.userId && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              style={styles.deleteUserBtn}
                            >
                              Sil
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        initialData={selectedNote}
      />
    </div>
  );
};

const styles = {
  // ... (Önceki stilleriniz aynı kalabilir, aşağıdakileri ekleyin/güncelleyin)
  container: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "system-ui, sans-serif",
    padding: "40px 20px",
  },
  header: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: { margin: 0, color: "#111827" },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  subTitle: { margin: 0, color: "#374151" },
  addBtn: {
    padding: "8px 16px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: { margin: "0 0 12px 0", color: "#111827", fontSize: "18px" },
  cardContent: {
    margin: "0 0 20px 0",
    color: "#4b5563",
    lineHeight: "1.5",
    flexGrow: 1,
    whiteSpace: "pre-wrap",
  },
  actionButtons: { display: "flex", gap: "10px", marginTop: "auto" },
  editBtn: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  deleteBtn: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  emptyText: { color: "#6b7280", textAlign: "center", padding: "40px 0" },

  // YENİ EKLENEN STİLLER
  tabContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    borderBottom: "2px solid #f3f4f6",
    paddingBottom: "10px",
  },
  tab: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "8px",
  },
  activeTab: {
    padding: "10px 20px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    borderRadius: "8px",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "12px 16px",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontWeight: "600",
    borderBottom: "2px solid #e5e7eb",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
  },
  badgeAdmin: {
    backgroundColor: "#fef08a",
    color: "#854d0e",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeUser: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  deleteUserBtn: {
    padding: "6px 12px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12px",
  },
};

export default Dashboard;
