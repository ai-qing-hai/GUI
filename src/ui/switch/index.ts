import { Rect, Line } from '@antv/g';
import { deepMix, isNil, omit, get, isPlainObject } from '@antv/util';
import type { RectStyleProps } from '@antv/g';
import { Tag } from '../tag';
import { GUI } from '../core/gui';
import { getShapeSpace } from '../../util';
import type { TagCfg } from '../tag/types';
import type { GUIOption } from '../../types';
import type { SwitchCfg, SwitchOptions } from './types';

export type { SwitchCfg, SwitchOptions };

// 开启颜色
const OPTION_COLOR = '#1890FF';
// 关闭颜色
const CLOSE_COLOR = '#00000040';
// 背景和控件间距
const PADDING = 2;
// 背景和childrenShape 的间距
const PADDING2 = 8;

// 默认tag 样式
const checkedChildrenStyle = {
  backgroundStyle: false,
  textStyle: {
    default: {
      fill: '#fff',
    },
  },
} as TagCfg;

export class Switch extends GUI<SwitchCfg> {
  /**
   * 组件 tag
   */
  public static tag = 'switch';

  /** 背景 组件 */
  private backgroundShape!: Rect;

  /** 动效 组件 */
  private rectStrokeShape!: Rect;

  /** 控件 组件 */
  private handleShape!: Rect;

  /** 选中时内容 组件 */
  private childrenShape: Tag[] = [];

  /** 轨迹 */
  private pathLineShape!: Line;

  /** 值 */
  private checked!: boolean;

  /** 默认值 */
  private defaultChecked!: boolean;

  /** 动画开启关闭 */
  private animateFlag!: boolean;

  /** SizeStyle */
  private sizeStyle!: RectStyleProps;

  /**
   * 默认配置项
   */
  public static defaultOptions: GUIOption<SwitchCfg> = {
    type: Switch.tag,
    style: {
      x: 0,
      y: 0,
      size: 22,
      defaultChecked: true,
      style: {
        default: {
          stroke: CLOSE_COLOR,
          fill: CLOSE_COLOR,
        },
        selected: {
          stroke: OPTION_COLOR,
          fill: OPTION_COLOR,
        },
      },
    },
  };

  constructor(options: SwitchOptions) {
    super(deepMix({}, Switch.defaultOptions, options));
    this.init();
  }

  public init(): void {
    this.getSizeStyle();
    this.initShape();
    this.update({});
    this.bindEvents();
  }

  public getChecked() {
    return this.checked;
  }

  /**
   * 组件的更新
   */
  public update(cfg: SwitchCfg) {
    this.attr(deepMix({}, this.attributes, cfg));
    this.getSizeStyle();
    // 更新开关
    this.updateChecked();
    // 更新 shape attr
    this.updateShape();
    // 如果 修改了 checked 开启动画
    if (this.animateFlag) {
      this.animateSiwtch();
    }
  }

  /**
   * 初始化创建
   */
  private initShape() {
    const { defaultChecked, checked } = this.attributes;
    this.defaultChecked = !!(checked || defaultChecked);
    this.checked = !!(isNil(checked) ? defaultChecked : checked);

    this.backgroundShape = this.createBackgroundShape();

    this.rectStrokeShape = this.createRectStrokeShape();

    this.handleShape = this.createHandleShape();

    this.backgroundShape.appendChild(this.handleShape);

    this.appendChild(this.rectStrokeShape);
    this.appendChild(this.backgroundShape);
  }

  private getSizeStyle() {
    const size = Number(this.attributes.size) || (Switch.defaultOptions.style.size as number);
    this.sizeStyle = {
      width: size * 2,
      height: size,
      radius: size / 2,
    };
  }

  // 创建 背景Shape
  private createBackgroundShape() {
    return new Rect({
      name: 'background',
      style: {
        ...Switch.defaultOptions.style,
        ...this.sizeStyle,
      },
    });
  }

  // 创建 动效Shape
  private createRectStrokeShape() {
    return new Rect({
      name: 'rectStroke',
      style: {
        ...Switch.defaultOptions.style,
        ...this.sizeStyle,
        strokeOpacity: 0.4,
        lineWidth: 0,
        fill: '#efefef',
      },
    });
  }

  // 创建 控件Shape
  private createHandleShape() {
    this.pathLineShape = new Line({ name: 'pathLine' });
    // 暂时使用 Rect 为之后的变形动画做准备
    return new Rect({
      name: 'handle',
      style: {
        width: 0,
        height: 0,
        y: PADDING,
        fill: '#fff',
        offsetPath: this.pathLineShape,
      },
    });
  }

  private updateShape() {
    // 创建/更新/销毁 开关显示标签 Shape
    this.updateCheckedChildrenShape();
    // 更新背景 + 动效
    this.updateBackgroundShape();
    // 更新控件
    this.updateHandleShape();
  }

  // 创建/更新/销毁 开关显示标签 Shape
  private updateCheckedChildrenShape() {
    ['checkedChildren', 'unCheckedChildren'].forEach((key, index) => {
      const children = get(this.attributes, key) as TagCfg;
      if (!this.childrenShape[index]) {
        this.childrenShape[index] = new Tag({
          name: key,
          style: checkedChildrenStyle,
        });
      }
      const childrenShape = this.childrenShape[index];
      if (isPlainObject(children)) {
        childrenShape.update({ ...omit(children, ['backgroundStyle', 'x']), x: 0 });
        // checked 控制这个有无
        (index === 0 ? this.checked : !this.checked)
          ? this.backgroundShape.appendChild(childrenShape)
          : this.backgroundShape.removeChild(childrenShape);
        childrenShape.update({
          x: index ? this.getShapeWidth() - getShapeSpace(childrenShape).width - PADDING2 : PADDING2,
        });
      } else {
        childrenShape?.destroy();
      }
    });
  }

  // 更新背景 + 动效
  private updateBackgroundShape() {
    const { style } = this.attributes;
    const { disabled } = this.attributes;
    const width = this.getShapeWidth();
    const newAttr = {
      ...this.sizeStyle,
      width,
      ...get(style, this.checked ? 'selected' : 'default'),
    };
    this.backgroundShape.attr({
      ...newAttr,
      cursor: disabled ? 'no-drop' : 'pointer',
      fillOpacity: disabled ? 0.4 : 1,
    });

    this.rectStrokeShape.attr(omit(newAttr, ['fill']));
  }

  // 更新控件
  private updateHandleShape() {
    const { height, radius } = this.sizeStyle;
    const width = this.getShapeWidth();
    const r = (radius as number) - PADDING;

    let updateAttr: RectStyleProps = {
      width: r * 2,
      height: r * 2,
      radius: r,
    };
    // 只有第一次的时候 才通过 width 改变 x 的位置
    if (!this.animateFlag) {
      updateAttr = {
        ...updateAttr,
        x: this.defaultChecked ? width - height + PADDING : PADDING,
      };
    }

    this.handleShape.attr(updateAttr);

    this.pathLineShape.attr({
      x1: width - height + PADDING,
      y1: PADDING,
      x2: PADDING,
      y2: PADDING,
    });
  }

  // 获取背景Shape宽度
  private getShapeWidth() {
    const { width } = this.sizeStyle;
    const childrenShape = this.childrenShape[this.checked ? 0 : 1];
    const childrenWidth = childrenShape ? getShapeSpace(childrenShape).width - PADDING2 : 0;

    return childrenWidth + width;
  }

  // 更新 checked 如果 没有传入 checked 并且 checked 没有改变则不更新
  private updateChecked() {
    const { checked } = this.attributes;
    this.animateFlag = !(isNil(checked) || this.checked === !!checked);
    // 当不存在 checked 或 checked 没有改变 则不需要更改 checked 和 发生动效
    if (this.animateFlag) this.checked = !!checked;
  }

  /**
   * 添加交互
   */
  private bindEvents() {
    this.addEventListener('mouseenter', () => {
      this.banEvent(this.clearBackgroundLine);
    });

    this.addEventListener('mouseleave', () => {
      this.banEvent(this.addBackgroundLine);
    });

    this.addEventListener('click', (e) => {
      this.banEvent(this.addClick);
      const { onClick } = this.attributes;
      onClick && onClick(e, this.checked);
    });

    window.addEventListener('click', () => {
      this.banEvent(this.clearBackgroundLine);
    });
  }

  // disabled 时 禁止交互
  private banEvent(fn: Function) {
    const { disabled, checked } = this.attributes;
    if (disabled || !isNil(checked)) return;
    fn.apply(this);
  }

  // 去除聚焦效果
  private clearBackgroundLine() {
    this.backgroundShape.attr({
      lineWidth: 0,
    });
  }

  // 添加聚焦效果
  private addBackgroundLine() {
    this.backgroundShape.attr({
      lineWidth: 5,
      strokeOpacity: 0.2,
    });
  }

  // siwtch 点击添加
  private addClick() {
    const { onChange, checked } = this.attributes;
    this.checked = checked || !this.checked;
    this.animateFlag = isNil(checked);
    onChange && onChange(this.checked);
    this.updateShape();
    this.animateSiwtch();
  }

  /**
   * 变换 背景/控件 + 动画效果 + 动效
   * 触发这个方法的情况 :
   * 1、初始化的时候，动画并不会发生， 但又改变颜色 所以可以直接使用。
   * 2、点击的时候
   * 3、update 改变 checked 的时候 外部控制 开关
   */
  private animateSiwtch() {
    // 点击动效
    this.rectStrokeShape.animate(
      [
        { lineWidth: 0, strokeOpacity: 0.5 },
        { lineWidth: 14, strokeOpacity: 0 },
      ],
      {
        duration: 400,
        easing: 'ease-on',
      }
    );

    // 中间控件 位置变换
    this.handleShape.animate(
      [
        { offsetDistance: this.checked ? 1 : 0 }, // 变换
        { offsetDistance: !this.checked ? 1 : 0 },
      ],
      {
        duration: 100,
        fill: 'forwards',
      }
    );
  }

  /**
   * 组件的清除
   */
  public clear() {
    this.handleShape.destroy();
    this.backgroundShape.destroy();
    this.rectStrokeShape.destroy();
  }
}
