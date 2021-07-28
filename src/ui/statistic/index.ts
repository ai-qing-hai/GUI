import { Text } from '@antv/g';
import { deepMix, get, isNil } from '@antv/util';
import { GUI } from '../core/gui';
import { Marker } from '../marker';
import type { StatisticAttrs, StatisticOptions } from './types';
import type { DisplayObject } from '../../types';

export { StatisticAttrs, StatisticOptions } from './types';

export class Statistic extends GUI<StatisticAttrs> {
  /**
   * 标签类型
   */
  public static tag = 'statistic';

  /**
   * 标题
   */
  protected titleShape: DisplayObject;

  /**
   * 内容
   */
  protected valueShape: DisplayObject;

  /**
   * 前缀 | 后缀
   */
  protected prefixShape: DisplayObject;

  protected suffixShape: DisplayObject;

  /**
   * 初始化 fix的 x y
   */
  protected fixAttrs: {
    [key: string]: { x: number; y: number };
  } = {};

  /**
   * 默认参数
   */
  private static defaultOptions = {
    type: Statistic.tag,
    attrs: {
      title: {
        // 标题
        text: '',
        style: {
          // 默认居中
          fontSize: 14, // 字体大小
          fill: '#00000073', // 颜色
        },
      }, // 值 number | string
      value: {
        style: {
          // 默认居中
          fontSize: 24,
          fill: '#000000d9',
        },
        prefix: '',
        suffix: '',
      }, // 值 number | string
      spacing: 5,
      dynamicTime: false,
    },
  };

  constructor(options: StatisticOptions) {
    super(deepMix({}, Statistic.defaultOptions, options));
    this.init();
  }

  attributeChangedCallback(name: string, value: any): void {}

  public init(): void {
    const { x, y } = this.attributes;
    this.createText();

    // 设置位置
    this.translate(x, y);
  }

  public createText() {
    this.createTitleShape();
    this.createValueShape();
    this.createFix();
  }

  // 创建标题
  public createTitleShape() {
    this.titleShape = new Text({
      attrs: this.getTitleShapeAttrs(),
    });
    this.appendChild(this.titleShape);
  }

  // 创建内容
  public createValueShape() {
    this.valueShape = new Text({
      attrs: this.getValueShapeAttrs(),
    });
    this.appendChild(this.valueShape);
  }

  // 获取标题配置
  public getTitleShapeAttrs() {
    const {
      title: { style },
    } = this.attributes;
    const titleHeight = style.fontSize + 5;
    const newTitleText = this.getNewText('title');

    return {
      x: 0,
      y: titleHeight,
      lineHeight: titleHeight,
      ...style,
      text: newTitleText,
    };
  }

  // 获取内容配置
  public getValueShapeAttrs() {
    const { title, value, spacing } = this.attributes;

    const { style: titleStyle } = title;
    const { style: valueStyle, prefix, suffix } = value;

    const titleHeight = titleStyle.fontSize + 5;
    const valueHeight = valueStyle.fontSize + 5;
    let newValueText = `${this.getNewText('value')}`;
    let valueX = 0;
    if (this.addFixAdapter(prefix)) {
      this.fixAttrs.prefix = prefix.attributes;
      this.prefixShape = prefix;
      valueX = this.getGroupWidth(prefix).width;
    } else {
      newValueText = `${prefix}${newValueText}`;
    }

    if (this.addFixAdapter(suffix)) {
      this.fixAttrs.suffix = suffix.attributes;
      this.suffixShape = suffix;
    } else {
      newValueText = `${newValueText}${suffix}`;
    }

    return {
      x: valueX,
      y: spacing + titleHeight + valueHeight, // title 文本高度 + spacing 上下间距
      lineHeight: valueHeight,
      ...valueStyle,
      text: newValueText,
    };
  }

  public createFix() {
    const {
      title: { style },
      spacing,
    } = this.attributes;

    const titleHeight = style.fontSize + 5;
    let valueWidth = this.getGroupWidth(this.valueShape).width;
    if (this.prefixShape) {
      const { x = 0, y = 0 } = this.fixAttrs.prefix;
      const { width, height } = this.getGroupWidth(this.prefixShape);
      valueWidth += width;
      this.prefixShape.attr({
        x: width + x,
        y: height + titleHeight + spacing + y + 5,
      });
      this.appendChild(this.prefixShape);
    }
    if (this.suffixShape) {
      const { x = 0, y = 0 } = this.fixAttrs.suffix;

      const { width, height } = this.getGroupWidth(this.suffixShape);
      this.suffixShape.attr({
        x: valueWidth + width + x,
        y: height + titleHeight + spacing + y + 5,
      });
      this.appendChild(this.suffixShape);
    }
  }

  // 过滤用
  public getNewText(key) {
    const { text, formatter } = this.attributes[key];
    if (isNil(text)) {
      return '';
    }
    return formatter ? formatter(text) : text;
  }

  // 添加 addPrefix suffix;
  public addFixAdapter(fix: string | number | DisplayObject) {
    return fix.constructor === Marker && get(fix, '__proto__') === Marker.prototype;
  }

  public getGroupWidth(group) {
    const textBbox = group.getBounds();
    const width = textBbox.getMax()[0] - textBbox.getMin()[0];
    const height = textBbox.getMax()[1] - textBbox.getMin()[1];
    return { width, height };
  }

  /**
   * 组件的更新
   */
  public update(cfg: StatisticAttrs) {
    this.attr(deepMix({}, this.attributes, cfg));
    this.titleShape.attr(this.getTitleShapeAttrs());
    this.valueShape.attr(this.getValueShapeAttrs());
  }

  public clear() {
    this.valueShape.destroy();
    this.titleShape.destroy();
  }
}
