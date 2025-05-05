
import PhoneEncryptor from '@/components/PhoneEncryptor';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-cyan-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-6">Phone Vault Cipher</h1>
        <PhoneEncryptor />
        <footer className="mt-8 text-center text-cyan-200 text-xs">
          <p>Secure encryption using AES-256-GCM</p>
          <p className="mt-1">All encryption is processed locally in your browser</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
