import EncryptionKeyPanel from '../components/EncryptionKeyPanel';
import UiPreferencesPanel from '../components/UiPreferencesPanel';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your encryption keys and preferences</p>
      </div>

      <div className="space-y-6">
        <EncryptionKeyPanel />
        <UiPreferencesPanel />
      </div>
    </div>
  );
}
