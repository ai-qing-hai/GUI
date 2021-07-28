import { Group } from '@antv/g';
import type { ShapeAttrs, ShapeCfg } from '../../types';

export interface TitleOption {
  text?: string;
  /**
   * 标题 自定义文本样式
   */
  style?: ShapeAttrs;
  /**
   * 文本格式化
   */
  formatter?: (text: string) => string | Group;
}
export interface ValueOption extends TitleOption {
  /**
   * 值 前缀
   */
  prefix?: string | number | Group;
  /**
   * 值 前缀
   */
  suffix?: string | number | Group;
}

export type StatisticAttrs = {
  /**
   * 省略超长文本
   */
  ellipsis?: boolean;
  /**
   * 文本与按钮边缘的间距
   */
  padding?: number;
  /**
   * 标题
   */
  title?: TitleOption;
  /**
   * 值 string | 数值 | 时间(毫秒)
   */
  value?: ValueOption;
  /**
   * 标题 值 上下间距
   */
  spacing?: number;
};

export type StatisticOptions = ShapeCfg & {
  attrs: StatisticAttrs;
};
