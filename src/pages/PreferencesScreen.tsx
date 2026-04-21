import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  Monitor,
  Bell,
  Globe,
  Smartphone,
  Info
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import './PreferencesScreen.css';

const PreferencesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const settingsGroups = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'dark-mode',
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Dark Mode',
          sub: 'Easier on the eyes in low light',
          type: 'toggle',
          value: theme === 'dark',
          action: toggleTheme
        }
      ]
    },
    {
      title: 'General',
      items: [
        {
          id: 'notifications',
          icon: Bell,
          label: 'Notifications',
          sub: 'Order status & updates',
          type: 'link',
          path: '#'
        },
        {
          id: 'language',
          icon: Globe,
          label: 'Language',
          sub: 'English (India)',
          type: 'link',
          path: '#'
        }
      ]
    },
    {
      title: 'Device',
      items: [
        {
          id: 'app-permissions',
          icon: Smartphone,
          label: 'App Permissions',
          sub: 'Camera, Location',
          type: 'link',
          path: '#'
        },
        {
          id: 'about',
          icon: Info,
          label: 'About Ritz Canteen',
          sub: 'Version 1.0.4 stable',
          type: 'link',
          path: '#'
        }
      ]
    }
  ];

  return (
    <div className="container preferences-page">
      <Header title="Preferences" />
      
      <main className="preferences-content safe-area-bottom">
        <div className="preferences-hero">
          <div className="hero-icon-container">
            {theme === 'dark' ? <Moon size={32} className="hero-icon" /> : <Sun size={32} className="hero-icon" />}
          </div>
          <h2>App Settings</h2>
          <p>Personalize your ordering experience</p>
        </div>

        <div className="settings-list">
          {settingsGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="settings-group">
              <h3 className="group-title">{group.title}</h3>
              <div className="group-items">
                {group.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`settings-item ${item.type === 'toggle' ? 'is-toggle' : ''}`}
                    onClick={() => item.type === 'link' && item.path !== '#' && navigate(item.path)}
                  >
                    <div className="item-icon-bg">
                      <item.icon size={20} />
                    </div>
                    <div className="item-main">
                      <span className="item-label">{item.label}</span>
                      <span className="item-sub">{item.sub}</span>
                    </div>
                    
                    {item.type === 'toggle' ? (
                      <button 
                        className={`theme-toggle-switch ${item.value ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          item.action?.();
                        }}
                      >
                        <div className="switch-handle" />
                      </button>
                    ) : (
                      <div className="item-action">
                        <ChevronLeft size={20} className="rotate-180" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="preferences-footer">
          <p>Managed by RIT IT Services</p>
          <p>© 2026 Positeasy-Clone</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default PreferencesScreen;
