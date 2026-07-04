const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = `        ) : activeTab === 'workflow' ? (`;
const endStr = `        ) : null}

      </main>`;

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr, startIndex) + endStr.length;

if (startIndex === -1 || endIndex < endStr.length) {
    console.error("Could not find start or end bounds.");
    process.exit(1);
}

const replacement = `        ) : activeTab === 'requests' ? (
          <div className="space-y-6 text-left">
            <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-750 rounded-xl shrink-0 mt-0.5">
                <Award className="w-5 h-5 text-emerald-800" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Jurnal Permintaan Sampel</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Daftar permintaan sampel yang masuk dari calon buyer Anda.
                </p>
              </div>
            </div>

            {sampleRequests.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-150 p-12 text-center max-w-lg mx-auto space-y-4 shadow-3xs">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">Belum Ada Permintaan</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    Saat ini belum ada permintaan sampel produk rill yang diajukan oleh calon buyer.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sampleRequests.map((req) => {
                  const isPending = req.status === 'pending';
                  const isShipped = req.status === 'shipped';
                  const isDelivered = req.status === 'delivered';
                  const isExporter = currentUser?.role === 'Trader' || currentUser?.role === 'Superadmin';

                  return (
                    <div 
                      key={req.id}
                      className="bg-white rounded-2xl border border-gray-150 hover:border-emerald-200 transition-all p-5 flex flex-col justify-between gap-4 shadow-3xs"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">KODE: {req.id}</span>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mt-0.5">{req.productName}</h4>
                          </div>
                          <span className={\`px-2 py-0.5 text-[9.5px] font-bold uppercase rounded-md border shrink-0 \${
                            isPending 
                              ? 'text-amber-700 bg-amber-50 border-amber-200'
                              : isShipped
                                ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }\`}>
                            {isPending ? 'Menunggu Kirim' : isShipped ? 'Dalam Perjalanan' : 'Telah Sampai'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 text-xs text-left">
                          <div>
                            <span className="text-gray-400 font-bold block text-[9.5px] uppercase tracking-wider font-sans">Calon Buyer:</span>
                            <span className="font-extrabold text-slate-800 block mt-0.5">{req.buyerName}</span>
                            <span className="text-[10px] text-slate-500 font-semibold block">{req.buyerCompany}</span>
                          </div>

                          <div>
                            <span className="text-gray-400 font-bold block text-[9.5px] uppercase tracking-wider font-sans">Jumlah Sampel:</span>
                            <span className="font-extrabold text-indigo-600 block mt-0.5">{req.quantity}</span>
                          </div>

                          <div className="col-span-2">
                            <span className="text-gray-400 font-bold block text-[9.5px] uppercase tracking-wider font-sans">Alamat Pengiriman:</span>
                            <span className="font-medium text-slate-600 block leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10.5px] mt-0.5">
                              {req.shippingAddress}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

      </main>`;

const newCode = code.slice(0, startIndex) + replacement + code.slice(endIndex);
fs.writeFileSync('src/App.tsx', newCode, 'utf8');
console.log('Patched App.tsx successfully');
