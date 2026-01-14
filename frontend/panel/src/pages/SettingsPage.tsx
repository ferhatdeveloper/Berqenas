import { useState } from 'react';
import { Save, Lock, Bell, User, Cloud } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {[
              { id: 'general', icon: Cloud, label: 'General' },
              { id: 'security', icon: Lock, label: 'Security' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'profile', icon: User, label: 'Profile' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === tab.id
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-8">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Platform Name</label>
                  <input
                    type="text"
                    defaultValue="Berqenas Cloud"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Base Domain</label>
                  <input
                    type="text"
                    defaultValue="berqenas.com"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for generating subdomains and API endpoints</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Region</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                    <option>eu-central-1 (Frankfurt)</option>
                    <option>us-east-1 (N. Virginia)</option>
                    <option>ap-southeast-1 (Singapore)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                    Enable
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                  </select>
                </div>
              </div>
            )}

            {/* Other tabs placeholders */}
            {['notifications', 'profile'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="bg-gray-700/50 p-4 rounded-full mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <p>This section is under development</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}