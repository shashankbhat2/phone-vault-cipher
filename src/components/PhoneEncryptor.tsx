
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, CopyIcon, KeyRound, Lock, Unlock, RefreshCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { encryptPhoneNumber, decryptPhoneNumber } from "@/utils/cryptoUtils";

const PhoneEncryptor = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [encryptedResult, setEncryptedResult] = useState("");
  const [decryptText, setDecryptText] = useState("");
  const [decryptedResult, setDecryptedResult] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("encrypt");
  const { toast } = useToast();

  useEffect(() => {
    // Load or generate encryption key on component mount
    const storedKey = localStorage.getItem("phoneEncryptionKey");
    if (storedKey) {
      setEncryptionKey(storedKey);
    } else {
      generateNewKey();
    }
  }, []);

  const generateNewKey = () => {
    // Generate a random 32-byte (256-bit) key as hex string
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const newKey = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    setEncryptionKey(newKey);
    localStorage.setItem("phoneEncryptionKey", newKey);
    
    toast({
      title: "New encryption key generated",
      description: "The new key has been saved to your browser's local storage.",
    });
  };

  const handleEncrypt = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number to encrypt",
        variant: "destructive",
      });
      return;
    }

    encryptPhoneNumber(phoneNumber, encryptionKey)
      .then(encrypted => {
        setEncryptedResult(encrypted);
        toast({
          title: "Phone number encrypted",
          description: "Your phone number has been successfully encrypted.",
        });
      })
      .catch(error => {
        toast({
          title: "Encryption failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      });
  };

  const handleDecrypt = () => {
    if (!decryptText.trim()) {
      toast({
        title: "Error",
        description: "Please enter encrypted text to decrypt",
        variant: "destructive",
      });
      return;
    }

    decryptPhoneNumber(decryptText, encryptionKey)
      .then(decrypted => {
        setDecryptedResult(decrypted);
        toast({
          title: "Phone number decrypted",
          description: "Your phone number has been successfully decrypted.",
        });
      })
      .catch(error => {
        toast({
          title: "Decryption failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-cyan-800/20">
      <CardHeader className="bg-gradient-to-r from-cyan-900 to-blue-900 text-white">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Lock className="h-6 w-6" /> Phone Vault Cipher
        </CardTitle>
        <CardDescription className="text-cyan-100">
          Securely encrypt and decrypt phone numbers
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="encrypt" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="encrypt" className="flex items-center gap-1">
            <Lock className="h-4 w-4" /> Encrypt
          </TabsTrigger>
          <TabsTrigger value="decrypt" className="flex items-center gap-1">
            <Unlock className="h-4 w-4" /> Decrypt
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="encrypt">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="border-2 border-cyan-700/20 focus-visible:ring-cyan-700"
              />
            </div>
            
            <Button 
              onClick={handleEncrypt} 
              className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-800 hover:to-blue-800"
            >
              <Lock className="mr-2 h-4 w-4" /> Encrypt Phone Number
            </Button>
            
            {encryptedResult && (
              <div className="bg-slate-800 p-3 rounded-md text-white relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-cyan-300 mb-1">Encrypted Result:</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 absolute top-2 right-2 text-cyan-400 hover:text-white"
                    onClick={() => copyToClipboard(encryptedResult)}
                  >
                    {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="text-sm break-all pr-8 font-mono">
                  {encryptedResult}
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="decrypt">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="decryptText" className="text-sm font-medium">
                Encrypted Text
              </label>
              <Input
                id="decryptText"
                placeholder="Enter encrypted text"
                value={decryptText}
                onChange={(e) => setDecryptText(e.target.value)}
                className="border-2 border-cyan-700/20 focus-visible:ring-cyan-700"
              />
            </div>
            
            <Button 
              onClick={handleDecrypt} 
              className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-800 hover:to-blue-800"
            >
              <Unlock className="mr-2 h-4 w-4" /> Decrypt Phone Number
            </Button>
            
            {decryptedResult && (
              <div className="bg-slate-800 p-3 rounded-md text-white relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-cyan-300 mb-1">Decrypted Result:</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 absolute top-2 right-2 text-cyan-400 hover:text-white"
                    onClick={() => copyToClipboard(decryptedResult)}
                  >
                    {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="text-sm break-all pr-8 font-mono">
                  {decryptedResult}
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="bg-gray-50 flex flex-col gap-4 py-4">
        <div className="flex items-center gap-2 text-sm w-full">
          <KeyRound className="h-4 w-4 text-cyan-700" />
          <span className="font-medium text-gray-700">Encryption Key:</span>
          <code className="bg-gray-100 px-2 py-1 rounded text-xs flex-1 font-mono truncate">
            {encryptionKey.substring(0, 8)}...{encryptionKey.substring(encryptionKey.length - 8)}
          </code>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6 text-cyan-700"
            onClick={generateNewKey}
            title="Generate new key"
          >
            <RefreshCcw className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          The encryption key is stored in your browser. Generating a new key will prevent decrypting previously encrypted data.
        </p>
      </CardFooter>
    </Card>
  );
};

export default PhoneEncryptor;
