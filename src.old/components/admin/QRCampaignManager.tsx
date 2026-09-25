import { AlertCircle, Download, ExternalLink, Loader2, Plus, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { QRCampaign } from '../../modules/qr-campaigns/domain/qr-campaign.entity';

interface QRCampaignManagerProps {
  adminToken: string;
  adminRole: string;
}

export const QRCampaignManager: React.FC<QRCampaignManagerProps> = ({
  adminToken,
  adminRole,
}) => {
  const [campaigns, setCampaigns] = useState<QRCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<QRCampaign | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [destinationPath, setDestinationPath] = useState('/apply');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data);
        if (json.data.length > 0 && !selectedCampaign) {
          setSelectedCampaign(json.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedCampaign) return;
    const fullUrl = `${window.location.origin}/?camp=${selectedCampaign.code}`;
    QRCode.toDataURL(fullUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#f8fafc',
        light: '#ffffff',
      },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [selectedCampaign]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          code: code.toLowerCase().trim(),
          name,
          description,
          destinationPath,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to create campaign.');
      }

      setShowCreateModal(false);
      setCode('');
      setName('');
      setDescription('');
      await loadCampaigns();
      setSelectedCampaign(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const downloadQrPng = () => {
    if (!qrDataUrl || !selectedCampaign) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `st-francis-qr-${selectedCampaign.code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] border-2 border-[#1e293b] p-6 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-[#f8fafc] uppercase tracking-wide">
            QR Campaigns & Admissions Promotion Portals
          </h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Architect and monitor physical flyer codes, high school visit banners, and campus recruitment gateways.
          </p>
        </div>

        {adminRole === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#382B20] hover:bg-[#231A12] text-[#FFFBEB] border border-[#a855f7] text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#a855f7]" />
            <span>Generate New QR Gateway</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Campaign List */}
        <div className="lg:col-span-2 bg-[#0f172a] border-2 border-[#1e293b] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#0f172a] bg-[#FAF6EE] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#382B20]">
              Active Campaign Gateways ({campaigns.length})
            </h3>
            <span className="text-[11px] font-mono text-[#94a3b8] uppercase">Interaction Ledger</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#64748b] flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#8b5cf6]" />
              <span className="text-xs uppercase font-bold">Querying campaign records...</span>
            </div>
          ) : (
            <div className="divide-y divide-[#0f172a]">
              {campaigns.map((camp) => {
                const isSelected = selectedCampaign?.id === camp.id;
                return (
                  <div
                    key={camp.id}
                    onClick={() => setSelectedCampaign(camp)}
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#0f172a] border-l-4 border-[#8b5cf6]' : 'hover:bg-[#020617]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
                          {camp.code}
                        </span>
                        <h4 className="font-bold text-[#f8fafc] text-sm">{camp.name}</h4>
                      </div>
                      {camp.description && (
                        <p className="text-xs text-[#665646] line-clamp-1">{camp.description}</p>
                      )}
                      <p className="text-[11px] font-mono text-[#64748b]">
                        Intake Destination: <span className="text-[#382B20] font-bold">{camp.destinationPath}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-[#f8fafc] font-mono tabular-nums">{camp.scanCount}</div>
                      <div className="text-[10px] uppercase font-bold text-[#94a3b8]">Total Inbound Scans</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Printable QR Code Inspector */}
        <div className="bg-[#0f172a] border-2 border-[#1e293b] shadow-xs p-6 flex flex-col items-center text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#382B20] mb-3">
            Printable QR Asset Frame
          </h3>

          {selectedCampaign ? (
            <div className="w-full space-y-4">
              <div className="p-4 border-2 border-[#1e293b] bg-[#020617] flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${selectedCampaign.code}`}
                    className="w-52 h-52 border border-[#1e293b] p-2 bg-[#0f172a]"
                  />
                ) : (
                  <div className="w-52 h-52 bg-[#0f172a] animate-pulse" />
                )}
                <div className="mt-3">
                  <span className="font-mono text-xs font-black px-2.5 py-1 bg-[#FAF4EA] text-[#855D1E] border border-[#E5D7BE]">
                    /?camp={selectedCampaign.code}
                  </span>
                  <p className="text-xs font-bold text-[#f8fafc] mt-2 uppercase">{selectedCampaign.name}</p>
                  <p className="text-[11px] font-mono text-[#94a3b8] mt-0.5">Interaction Metric: {selectedCampaign.scanCount} scans logged</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={downloadQrPng}
                  className="w-full py-2.5 px-4 bg-[#8b5cf6] hover:bg-[#B45309] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Print-Ready PNG</span>
                </button>

                <a
                  href={`/?camp=${selectedCampaign.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-4 bg-[#0f172a] border border-[#1e293b] hover:bg-[#FAF6EE] text-[#382B20] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Test Gateway Link</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8b5cf6]" />
                </a>
              </div>
            </div>
          ) : (
            <div className="py-20 text-[#64748b] text-xs uppercase font-bold">Select a campaign channel to view QR codes.</div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border-2 border-[#1e293b] shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#0f172a] pb-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#8b5cf6]" />
                <h3 className="font-black text-[#f8fafc] text-sm uppercase tracking-wide">
                  New QR Enrollment Gateway
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#64748b] hover:text-[#f8fafc] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-[#FEF2F2] border-l-4 border-[#DC2626] text-[#991B1B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Gateway Slug Code <span className="text-[#B45309]">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-[#FAF6EE] border border-r-0 border-[#1e293b] text-[#94a3b8] text-xs font-mono">
                    /?camp=
                  </span>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. spring-expo-2026"
                    className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] text-xs font-mono text-[#f8fafc] focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Campaign Title <span className="text-[#B45309]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Regional Science Fair 2026"
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] text-xs text-[#f8fafc] focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#382B20] mb-1">
                  Description / Channel Location
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Printed banners at booth B4, brochures, poster displays."
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#1e293b] text-xs text-[#f8fafc] focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#0f172a]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#0f172a] border border-[#1e293b] text-xs font-bold uppercase text-[#382B20] hover:bg-[#FAF6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#382B20] hover:bg-[#231A12] text-[#FFFBEB] border border-[#a855f7] text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {creating ? 'Registering...' : 'Publish Gateway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
