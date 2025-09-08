import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { AuthStorage } from '@/types/user';
import { toast } from '@/hooks/use-toast';
import { ClientJS } from 'clientjs';


function buildDeviceInfo(): string {
  try {
    const client = new ClientJS();
    let str = '{' + client.getFingerprint() + '}{WebAuth}{';
    if (client.getDevice() !== undefined)
      str += client.getDeviceVendor() + ' ' + client.getDevice() + ' · ';
    if (client.getOS() !== undefined)
      str += client.getOS() + ' ' + client.getOSVersion() + ' · ';
    if (client.getBrowser() !== undefined)
      str += client.getBrowser() + ' ' + client.getBrowserMajorVersion();
    return str + '}';
  } catch {
    return '{unknown}{WebAuth}{Windows 10 · Chrome 136}';
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const deviceInfo = useMemo(() => {
    try {
      return buildDeviceInfo();
    } catch {
      return '{unknown}{WebAuth}{Windows 10 · Chrome 136}';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    setLoading(true);
    try {
      await authService.login({ DeviceInfo: deviceInfo, UserID: userId, Password: password });
      const user = await authService.getUserInfo();
      AuthStorage.setUser(user);
      toast({ title: 'Đăng nhập thành công' });
      navigate('/');
    } catch (err) {
      toast({ title: 'Đăng nhập thất bại', description: err instanceof Error ? err.message : 'Vui lòng thử lại' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Đăng nhập" page="home" onPageChange={() => {}}>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Đăng nhập</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="userid">Mã sinh viên</Label>
                  <Input id="userid" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Mã sinh viên của bạn" />
                </div>
                <div>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                </div>
                <Button type="submit" disabled={loading || !userId || !password} className="w-full">
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}


