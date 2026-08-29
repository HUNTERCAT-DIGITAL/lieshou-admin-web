/**
 * React i18n 绑定（@lieshoucloud/i18n · 前端样板 2026-09）.
 *
 * useSyncExternalStore 订阅语言变化 → 组件自动重渲染；
 * antd ConfigProvider locale / dayjs 语言在 main.tsx 跟随 useLocale() 同步切换。
 *
 * 用法：
 *   const { t, locale, setLocale } = useI18n();
 *   t('common.action.confirm');
 */
import { useSyncExternalStore } from 'react';
import {
  getLocale,
  onLocaleChange,
  setLocale as i18nSetLocale,
  t as i18nT,
  type Locale,
  type TranslationKey,
  type TranslationParams,
} from '@lieshoucloud/i18n';

const LOCALE_KEY = 'lsc_locale';

/** 当前语言（响应式，变化触发重渲染） */
export function useLocale(): Locale {
  return useSyncExternalStore(onLocaleChange, getLocale, getLocale);
}

/** 类型安全 t 函数（随语言变化重渲染） */
export function useT(): (key: TranslationKey, params?: TranslationParams) => string {
  useLocale();
  return i18nT;
}

/** 完整 i18n 组合 */
export function useI18n(): {
  locale: Locale;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  setLocale: (l: Locale) => void;
} {
  const locale = useLocale();
  return {
    locale,
    t: (key, params) => i18nT(key, params),
    setLocale: (l) => {
      i18nSetLocale(l);
      localStorage.setItem(LOCALE_KEY, l);
    },
  };
}

/** 恢复上次选择语言（main.tsx 启动时调一次） */
export function restoreLocale(): void {
  const saved = localStorage.getItem(LOCALE_KEY);
  if (saved === 'zh-CN' || saved === 'en-US') i18nSetLocale(saved);
}
