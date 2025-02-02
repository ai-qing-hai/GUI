import { Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Continuous } from '@antv/gui';
import * as dat from 'dat.gui';

const renderer = new CanvasRenderer({
  enableDirtyRectangleRenderingDebug: false,
  enableAutoRendering: true,
  enableDirtyRectangleRendering: true,
});

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 600,
  renderer,
});

const continuous = new Continuous({
  style: {
    title: {
      content: '连续图例',
    },
    label: {
      align: 'outside',
    },
    rail: {
      width: 300,
      height: 30,
      ticks: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    },
    handle: false,
    min: 0,
    max: 100,
    color: [
      '#d0e3fa',
      '#acc7f6',
      '#8daaf2',
      '#6d8eea',
      '#4d73cd',
      '#325bb1',
      '#5a3e75',
      '#8c3c79',
      '#e23455',
      '#e7655b',
    ],
  },
});

canvas.appendChild(continuous);

/** -------------------------配置区域--------------------------------------- */
const $wrapper = document.getElementById('container');
const cfg = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(cfg.domElement);
const continuousCfg = {
  x: 0,
  y: 0,
  图例宽度: 300,
  图例高度: 30,
};
cfg.add(continuousCfg, 'x', 0, 300).onChange((x) => {
  continuous.attr({ x });
});
cfg.add(continuousCfg, 'y', 0, 300).onChange((y) => {
  continuous.attr({ y });
});
cfg.add(continuousCfg, '图例宽度', 30, 300).onChange((width) => {
  continuous.update({ rail: { width } });
});
cfg.add(continuousCfg, '图例高度', 30, 300).onChange((height) => {
  continuous.update({ rail: { height } });
});
