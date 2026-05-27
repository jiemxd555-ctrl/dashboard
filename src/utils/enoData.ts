import { ENOMember } from '../types'

export const DEFAULT_ENO_TEAM: ENOMember[] = [
  {
    id: 'eno-qiao',
    name: '桥',
    role: '主摄 · 主管',
    metric: '4–6 套',
    sections: [
      {
        tag: '每日',
        items: [
          { name: '上新图（高客单设计款）', qty: '4–6 套', primary: true },
          { name: '团队工作指导 / 现场把控', qty: '弹性' },
        ],
      },
      {
        tag: '每月',
        items: [
          { name: '视觉知识文档编辑', qty: '2 份' },
          { name: '视觉创新方案', qty: '1 份' },
        ],
      },
      {
        tag: '不定期',
        items: [
          { name: '外部合作沟通', qty: '主责' },
          { name: '人员招聘', qty: '主责' },
          { name: '拍摄道具采购', qty: '联合' },
        ],
      },
    ],
  },
  {
    id: 'eno-zhihan',
    name: '芷涵',
    role: '主摄',
    metric: '5 套',
    sections: [
      {
        tag: '每日',
        items: [
          { name: '上新图（高客单设计款）', qty: '5 套', primary: true },
        ],
      },
      {
        tag: '每月',
        items: [
          { name: '视觉创新方案', qty: '1 份' },
        ],
      },
      {
        tag: '不定期',
        items: [
          { name: '参与拍摄道具采购', qty: '联合桥' },
        ],
      },
    ],
  },
  {
    id: 'eno-danni',
    name: '丹妮',
    role: '摄影助理',
    metric: '4–6 套',
    sections: [
      {
        tag: '每日',
        items: [
          { name: '上新图（基础设计款）', qty: '4–6 套', primary: true },
          { name: '后期修图（自己 + 芷涵）', qty: '' },
          { name: '云作品平台图片上传', qty: '' },
        ],
      },
    ],
  },
  {
    id: 'eno-pengbo',
    name: '鹏博',
    role: '摄影助理',
    metric: '3–6 套',
    sections: [
      {
        tag: '每日',
        items: [
          { name: '上新图（基础设计款）', qty: '3–6 套', primary: true },
          { name: '客户定妆照', qty: '1–3 件' },
          { name: '后期修图（自己 + 桥）', qty: '' },
          { name: '云作品平台图片上传', qty: '' },
        ],
      },
      {
        tag: '每周',
        items: [
          { name: '电商产品图', qty: '5 套' },
        ],
      },
      {
        tag: '不定期',
        items: [
          { name: '专利图拍摄', qty: '随机' },
        ],
      },
    ],
  },
]
