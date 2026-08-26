/**
 * 门户页（Phase 8 · 获客入口 + ADR-0035 · 行业版门户）.
 *
 * 未登录访问 / 时展示：按部署版别（EditionConfig）分发到
 *   - generic → GenericPortal（平台通用门户 + 行业版入口导航）
 *   - layer   → LegalPortal（法律行业版门户）
 *   - zhiye   → EduPortal（教育行业版门户）
 *   - jmzz    → MfgPortal（精密制造版门户）
 * 版别识别：VITE_EDITION（compose 注入）→ 域名推断 → generic。
 */

import { resolveEditionId } from '../config/editions';

import EduPortal from './portal/EduPortal';
import GenericPortal from './portal/GenericPortal';
import LegalPortal from './portal/LegalPortal';
import MfgPortal from './portal/MfgPortal';

export default function Portal() {
  const editionId = resolveEditionId();
  switch (editionId) {
    case 'layer':
    case 'legalmind':
      return <LegalPortal />;
    case 'zhiye':
      return <EduPortal />;
    case 'jmzz':
      return <MfgPortal />;
    default:
      return <GenericPortal />;
  }
}
