/**
 * 网站备案信息（ICP + 公安备案）· 全站 footer 统一展示
 * 公司主体读 edition.companyName（客户版别注入，dwjk=物联网云平台）；
 * 备案号见 edition 或保留默认（客户部署时替换）。
 * 使用: <BeianFooter dark />（深色底） / <BeianFooter />（浅色底）
 */
import { getEdition } from '../config/editions';

export function BeianFooter({ dark = false }: { dark?: boolean }) {
  const color = dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)';
  const companyName = getEdition().companyName || '南昌猎手猫数字科技有限公司';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        fontSize: 13,
        lineHeight: '20px',
      }}
    >
      <span style={{ color }}>{companyName}</span>
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color, textDecoration: 'none' }}
      >
        赣ICP备19006787号-1
      </a>
      <a
        href="https://beian.mps.gov.cn/#/query/webSearch?code=36010902000208"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color, textDecoration: 'none' }}
      >
        赣公网安备36010902000208号
      </a>
    </div>
  );
}
