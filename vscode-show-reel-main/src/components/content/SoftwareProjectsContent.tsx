import { ProjectData } from '../VSCodeLayout';
import { Download, Github } from 'lucide-react';

interface SoftwareProjectsContentProps {
  onProjectClick: (project: ProjectData) => void;
}

export const SoftwareProjectsContent = ({ onProjectClick }: SoftwareProjectsContentProps) => {
  const softwareProjects: ProjectData[] = [
    {
      id: '4',
      name: 'File Organizer Pro',
      description: 'Automated file organization tool with custom rules',
      category: 'software',
      technologies: ['Python', 'Tkinter', 'Watchdog', 'SQLite'],
      codeSnippet: `# File Organizer - Main Application
import os
import shutil
import sqlite3
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

class FileOrganizer:
    def __init__(self):
        self.db_path = "file_organizer.db"
        self.init_database()
        self.observer = None
        
    def init_database(self):
        """Initialize SQLite database for storing rules"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rules (
                id INTEGER PRIMARY KEY,
                extension TEXT NOT NULL,
                destination_folder TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    
    def add_rule(self, extension, destination):
        """Add a new organization rule"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO rules (extension, destination_folder) VALUES (?, ?)",
            (extension, destination)
        )
        conn.commit()
        conn.close()
    
    def organize_file(self, file_path):
        """Organize a single file based on rules"""
        if not os.path.isfile(file_path):
            return False
            
        file_extension = Path(file_path).suffix.lower()
        
        # Get destination from rules
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT destination_folder FROM rules WHERE extension = ?",
            (file_extension,)
        )
        result = cursor.fetchone()
        conn.close()
        
        if result:
            destination_folder = result[0]
            os.makedirs(destination_folder, exist_ok=True)
            
            filename = os.path.basename(file_path)
            destination_path = os.path.join(destination_folder, filename)
            
            # Handle duplicate filenames
            counter = 1
            while os.path.exists(destination_path):
                name, ext = os.path.splitext(filename)
                destination_path = os.path.join(
                    destination_folder, 
                    f"{name}_{counter}{ext}"
                )
                counter += 1
            
            shutil.move(file_path, destination_path)
            return True
        
        return False

class FileWatcher(FileSystemEventHandler):
    def __init__(self, organizer):
        self.organizer = organizer
    
    def on_created(self, event):
        if not event.is_directory:
            self.organizer.organize_file(event.src_path)

# GUI Application
class FileOrganizerGUI:
    def __init__(self):
        self.organizer = FileOrganizer()
        self.root = tk.Tk()
        self.root.title("File Organizer Pro")
        self.root.geometry("600x400")
        self.create_widgets()
    
    def create_widgets(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Watch folder selection
        ttk.Label(main_frame, text="Watch Folder:").grid(row=0, column=0, sticky=tk.W)
        self.folder_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.folder_var, width=50).grid(row=0, column=1, padx=5)
        ttk.Button(main_frame, text="Browse", command=self.select_folder).grid(row=0, column=2)
        
        # Start/Stop buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=1, column=0, columnspan=3, pady=10)
        ttk.Button(button_frame, text="Start Watching", command=self.start_watching).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Stop Watching", command=self.stop_watching).pack(side=tk.LEFT, padx=5)
    
    def select_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.folder_var.set(folder)
    
    def start_watching(self):
        folder = self.folder_var.get()
        if not folder or not os.path.exists(folder):
            messagebox.showerror("Error", "Please select a valid folder")
            return
        
        self.observer = Observer()
        event_handler = FileWatcher(self.organizer)
        self.observer.schedule(event_handler, folder, recursive=False)
        self.observer.start()
        messagebox.showinfo("Success", "File watching started!")
    
    def stop_watching(self):
        if self.observer:
            self.observer.stop()
            self.observer.join()
            messagebox.showinfo("Success", "File watching stopped!")
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = FileOrganizerGUI()
    app.run()`
    },
    {
      id: '5',
      name: 'Password Manager',
      description: 'Secure local password management application',
      category: 'software',
      technologies: ['C#', '.NET', 'WPF', 'AES Encryption'],
      codeSnippet: `// Password Manager - C# WPF Application
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;

namespace PasswordManager
{
    public class PasswordEntry
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Website { get; set; }
        public string Username { get; set; }
        public string EncryptedPassword { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime LastModified { get; set; } = DateTime.Now;
    }

    public class EncryptionService
    {
        private readonly byte[] _key;
        private readonly byte[] _iv;

        public EncryptionService(string masterPassword)
        {
            using (var sha256 = SHA256.Create())
            {
                _key = sha256.ComputeHash(Encoding.UTF8.GetBytes(masterPassword));
            }
            _iv = new byte[16]; // AES block size
            Array.Copy(_key, _iv, 16);
        }

        public string Encrypt(string plainText)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = _key;
                aes.IV = _iv;
                
                using (var encryptor = aes.CreateEncryptor())
                using (var ms = new MemoryStream())
                using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                using (var sw = new StreamWriter(cs))
                {
                    sw.Write(plainText);
                    sw.Close();
                    return Convert.ToBase64String(ms.ToArray());
                }
            }
        }

        public string Decrypt(string cipherText)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = _key;
                aes.IV = _iv;
                
                using (var decryptor = aes.CreateDecryptor())
                using (var ms = new MemoryStream(Convert.FromBase64String(cipherText)))
                using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
                using (var sr = new StreamReader(cs))
                {
                    return sr.ReadToEnd();
                }
            }
        }
    }

    public class PasswordStorage
    {
        private readonly string _dataPath;
        private readonly EncryptionService _encryption;
        private List<PasswordEntry> _passwords;

        public PasswordStorage(string masterPassword)
        {
            _dataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "PasswordManager", "passwords.json"
            );
            _encryption = new EncryptionService(masterPassword);
            _passwords = new List<PasswordEntry>();
            
            Directory.CreateDirectory(Path.GetDirectoryName(_dataPath));
            LoadPasswords();
        }

        public void AddPassword(string website, string username, string password)
        {
            var entry = new PasswordEntry
            {
                Website = website,
                Username = username,
                EncryptedPassword = _encryption.Encrypt(password)
            };
            
            _passwords.Add(entry);
            SavePasswords();
        }

        public void UpdatePassword(string id, string website, string username, string password)
        {
            var entry = _passwords.Find(p => p.Id == id);
            if (entry != null)
            {
                entry.Website = website;
                entry.Username = username;
                entry.EncryptedPassword = _encryption.Encrypt(password);
                entry.LastModified = DateTime.Now;
                SavePasswords();
            }
        }

        public void DeletePassword(string id)
        {
            _passwords.RemoveAll(p => p.Id == id);
            SavePasswords();
        }

        public string GetPassword(string id)
        {
            var entry = _passwords.Find(p => p.Id == id);
            return entry != null ? _encryption.Decrypt(entry.EncryptedPassword) : null;
        }

        public List<PasswordEntry> GetAllEntries()
        {
            return new List<PasswordEntry>(_passwords);
        }

        private void LoadPasswords()
        {
            try
            {
                if (File.Exists(_dataPath))
                {
                    var json = File.ReadAllText(_dataPath);
                    _passwords = JsonSerializer.Deserialize<List<PasswordEntry>>(json) ?? new List<PasswordEntry>();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading passwords: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void SavePasswords()
        {
            try
            {
                var json = JsonSerializer.Serialize(_passwords, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_dataPath, json);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error saving passwords: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }

    public partial class MainWindow : Window
    {
        private PasswordStorage _storage;
        private string _masterPassword;

        public MainWindow()
        {
            InitializeComponent();
            ShowLoginDialog();
        }

        private void ShowLoginDialog()
        {
            var loginWindow = new LoginWindow();
            if (loginWindow.ShowDialog() == true)
            {
                _masterPassword = loginWindow.MasterPassword;
                _storage = new PasswordStorage(_masterPassword);
                RefreshPasswordList();
            }
            else
            {
                Application.Current.Shutdown();
            }
        }

        private void RefreshPasswordList()
        {
            passwordListView.ItemsSource = _storage.GetAllEntries();
        }

        private void AddPassword_Click(object sender, RoutedEventArgs e)
        {
            var addWindow = new AddPasswordWindow();
            if (addWindow.ShowDialog() == true)
            {
                _storage.AddPassword(addWindow.Website, addWindow.Username, addWindow.Password);
                RefreshPasswordList();
            }
        }

        private void CopyPassword_Click(object sender, RoutedEventArgs e)
        {
            if (passwordListView.SelectedItem is PasswordEntry entry)
            {
                var password = _storage.GetPassword(entry.Id);
                Clipboard.SetText(password);
                MessageBox.Show("Password copied to clipboard!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }
    }
}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="font-code">
        <span className="syntax-comment"># Desktop software projects</span>
        <br />
        <br />
        <span className="syntax-keyword">software_projects</span> = [
        <br />
        {softwareProjects.map((project, index) => (
          <span key={project.id}>
            <span className="ml-4">
              {"{"} <span className="syntax-string">"name"</span>: <span className="syntax-string">"{project.name}"</span>, <span className="syntax-string">"lang"</span>: <span className="syntax-string">"{project.technologies[0]}"</span> {"}"}
            </span>
            {index < softwareProjects.length - 1 && <>,</>}
            <br />
          </span>
        ))}
        <span>]</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {softwareProjects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => onProjectClick(project)}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold font-sans">{project.name}</h3>
              <div className="flex space-x-2">
                <Download className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                <Github className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>
            </div>
            
            <p className="text-muted-foreground font-sans mb-4">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-sans"
                >
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground font-sans">
              Click to view source code →
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-card rounded-lg border border-border">
        <h3 className="text-xl font-bold mb-4 font-sans">Development Tools</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded border border-border">
            <h4 className="font-semibold font-sans mb-2">Python</h4>
            <p className="text-sm text-muted-foreground font-sans">Tkinter, PyQt, Automation Scripts</p>
          </div>
          <div className="p-4 bg-muted/50 rounded border border-border">
            <h4 className="font-semibold font-sans mb-2">C#/.NET</h4>
            <p className="text-sm text-muted-foreground font-sans">WPF, WinForms, Console Apps</p>
          </div>
          <div className="p-4 bg-muted/50 rounded border border-border">
            <h4 className="font-semibant font-sans mb-2">Electron</h4>
            <p className="text-sm text-muted-foreground font-sans">Cross-platform Desktop Apps</p>
          </div>
        </div>
      </div>
    </div>
  );
};