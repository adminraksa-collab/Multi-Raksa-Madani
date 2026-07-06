const fs = require('fs');

let content = fs.readFileSync('src/components/SystemMetrics.tsx', 'utf8');

// Update getChartData
content = content.replace(
/const getChartData = \(used: number, limit: number, usedLabel: string, freeLabel: string\) => {[\s\S]*?};\n\n  const readData = getChartData\([^;]+;\n  const writeData = getChartData\([^;]+;/m,
`const getChartData = (used: number, limit: number, isWrites: boolean) => {
    const usedFree = Math.min(used, limit);
    const overQuota = Math.max(0, used - limit);
    const remaining = Math.max(0, limit - used);
    
    return [
      { name: lang === 'id' ? 'Gratis Terpakai' : 'Free Used', value: usedFree, color: isWrites ? '#6366f1' : '#3b82f6' },
      ...(overQuota > 0 ? [{ name: lang === 'id' ? 'Pemakaian Berbayar' : 'Paid Usage', value: overQuota, color: '#ef4444' }] : []),
      ...(remaining > 0 ? [{ name: lang === 'id' ? 'Sisa Gratis' : 'Free Remaining', value: remaining, color: '#e2e8f0' }] : []),
    ];
  };

  const readData = getChartData(totalReads, READ_QUOTA_FREE, false);
  const writeData = getChartData(totalWrites, WRITE_QUOTA_FREE, true);

  const RATE_USD_TO_IDR = 15500;
  const READ_COST_100K = 0.036;
  const WRITE_COST_100K = 0.108;`
);

// Update h-56 to min-h-[14rem]
content = content.replace(/h-56/g, 'h-auto min-h-[14rem]');

// Update Reads part
content = content.replace(
/<div className="text-center mt-1">\s*<div className="text-sm font-black text-blue-600 leading-tight">\{totalReads.toLocaleString\(\)\}<\/div>\s*<div className="text-\[9px\] text-gray-400">\/ 50K<\/div>\s*<\/div>/m,
`<div className="w-full mt-2">
                  <div className="flex justify-between items-center text-[9px] mb-1">
                    <span className="text-gray-500">{lang === 'id' ? 'Gratis:' : 'Free:'}</span>
                    <span className="font-bold text-slate-700">{Math.min(totalReads, READ_QUOTA_FREE).toLocaleString()} / 50K</span>
                  </div>
                  {totalReads > READ_QUOTA_FREE && (
                    <>
                      <div className="flex justify-between items-center text-[9px] mb-1">
                        <span className="text-red-500">{lang === 'id' ? 'Berbayar:' : 'Paid:'}</span>
                        <span className="font-bold text-red-600">{(totalReads - READ_QUOTA_FREE).toLocaleString()} ops</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] bg-red-50 px-1 py-0.5 rounded border border-red-100">
                        <span className="text-red-600 font-medium">Est:</span>
                        <span className="font-bold text-red-700">Rp {(((totalReads - READ_QUOTA_FREE) / 100000) * READ_COST_100K * RATE_USD_TO_IDR).toLocaleString('id-ID', {maximumFractionDigits:0})}</span>
                      </div>
                    </>
                  )}
                </div>`
);

// Update Writes part
content = content.replace(
/<div className="text-center mt-1">\s*<div className="text-sm font-black text-indigo-600 leading-tight">\{totalWrites.toLocaleString\(\)\}<\/div>\s*<div className="text-\[9px\] text-gray-400">\/ 20K<\/div>\s*<\/div>/m,
`<div className="w-full mt-2">
                  <div className="flex justify-between items-center text-[9px] mb-1">
                    <span className="text-gray-500">{lang === 'id' ? 'Gratis:' : 'Free:'}</span>
                    <span className="font-bold text-slate-700">{Math.min(totalWrites, WRITE_QUOTA_FREE).toLocaleString()} / 20K</span>
                  </div>
                  {totalWrites > WRITE_QUOTA_FREE && (
                    <>
                      <div className="flex justify-between items-center text-[9px] mb-1">
                        <span className="text-red-500">{lang === 'id' ? 'Berbayar:' : 'Paid:'}</span>
                        <span className="font-bold text-red-600">{(totalWrites - WRITE_QUOTA_FREE).toLocaleString()} ops</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] bg-red-50 px-1 py-0.5 rounded border border-red-100">
                        <span className="text-red-600 font-medium">Est:</span>
                        <span className="font-bold text-red-700">Rp {(((totalWrites - WRITE_QUOTA_FREE) / 100000) * WRITE_COST_100K * RATE_USD_TO_IDR).toLocaleString('id-ID', {maximumFractionDigits:0})}</span>
                      </div>
                    </>
                  )}
                </div>`
);

// Remove the inline fill coloring condition in Pie since color is already passed in getChartData
content = content.replace(
/<Cell key=\{i\} fill=\{e.color === '#3b82f6' \? '#6366f1' : e.color\} \/>/g,
`<Cell key={i} fill={e.color} />`
);


fs.writeFileSync('src/components/SystemMetrics.tsx', content);
