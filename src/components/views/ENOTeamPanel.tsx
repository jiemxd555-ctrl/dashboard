import React from 'react'

interface TaskItem {
  name: string
  qty: string
  primary?: boolean
}

interface Section {
  tag: string
  items: TaskItem[]
}

interface Member {
  name: string
  role: string
  metric: string
  sections: Section[]
}

const team: Member[] = [
  {
    name: '桥', role: '主摄 · 主管', metric: '4–6 套',
    sections: [
      {
        tag: '每日', items: [
          { name: '上新图（高客单设计款）', qty: '4–6 套', primary: true },
          { name: '团队工作指导 / 现场把控', qty: '弹性' },
        ],
      },
      {
        tag: '每月', items: [
          { name: '视觉知识文档编辑', qty: '2 份' },
          { name: '视觉创新方案', qty: '1 份' },
        ],
      },
      {
        tag: '不定期', items: [
          { name: '外部合作沟通', qty: '主责' },
          { name: '人员招聘', qty: '主责' },
          { name: '拍摄道具采购', qty: '联合' },
        ],
      },
    ],
  },
  {
    name: '芷涵', role: '主摄', metric: '5 套',
    sections: [
      {
        tag: '每日', items: [
          { name: '上新图（高客单设计款）', qty: '5 套', primary: true },
        ],
      },
      {
        tag: '每月', items: [
          { name: '视觉创新方案', qty: '1 份' },
        ],
      },
      {
        tag: '不定期', items: [
          { name: '参与拍摄道具采购', qty: '联合桥' },
        ],
      },
    ],
  },
  {
    name: '丹妮', role: '摄影助理', metric: '4–6 套',
    sections: [
      {
        tag: '每日', items: [
          { name: '上新图（基础设计款）', qty: '4–6 套', primary: true },
          { name: '后期修图（自己 + 芷涵）', qty: '' },
          { name: '云作品平台图片上传', qty: '' },
        ],
      },
    ],
  },
  {
    name: '鹏博', role: '摄影助理', metric: '3–6 套',
    sections: [
      {
        tag: '每日', items: [
          { name: '上新图（基础设计款）', qty: '3–6 套', primary: true },
          { name: '客户定妆照', qty: '1–3 件' },
          { name: '后期修图（自己 + 桥）', qty: '' },
          { name: '云作品平台图片上传', qty: '' },
        ],
      },
      {
        tag: '每周', items: [
          { name: '电商产品图', qty: '5 套' },
        ],
      },
      {
        tag: '不定期', items: [
          { name: '专利图拍摄', qty: '随机' },
        ],
      },
    ],
  },
]

export function ENOTeamPanel() {
  return (
    <div className="mt-10 md:mt-14">
      {/* Section label */}
      <p
        className="text-[11px] tracking-[0.18em] uppercase mb-1.5"
        style={{ color: '#9B7E50' }}
      >
        03 ROLE CARDS
      </p>

      {/* Title row */}
      <div className="flex items-baseline justify-between mb-5 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold" style={{ color: '#1A1A1A' }}>
          角色与任务分配
        </h2>
        <span className="text-[11px] hidden sm:block" style={{ color: '#8A8A8A' }}>
          主管 / 主摄 / 助理 三档结构
        </span>
      </div>

      {/* 2×2 Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {team.map(member => (
          <div
            key={member.name}
            className="bg-white rounded-sm"
            style={{ border: '1px solid #EAE6DE', padding: '20px 22px' }}
          >
            {/* Card header: name + role tag + metric */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-bold shrink-0"
                  style={{ fontSize: '19px', color: '#1A1A1A' }}
                >
                  {member.name}
                </span>
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded-sm shrink-0"
                  style={{ color: '#9B7E50', background: '#FAF6EF' }}
                >
                  {member.role}
                </span>
              </div>
              <span
                className="text-[13px] shrink-0 ml-2"
                style={{ color: '#8A8A8A' }}
              >
                日均 {member.metric}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#EAE6DE', marginBottom: '12px' }} />

            {/* Sections */}
            <div className="space-y-3.5">
              {member.sections.map(section => (
                <div key={section.tag}>
                  <p
                    className="tracking-wide mb-1.5"
                    style={{ fontSize: '11px', color: '#8A8A8A' }}
                  >
                    {section.tag}
                  </p>
                  <div className="space-y-1.5">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-baseline">
                        <span
                          className="flex-1 pr-3 leading-snug"
                          style={{
                            fontSize: '13px',
                            color: item.primary ? '#1A1A1A' : '#555555',
                            fontWeight: item.primary ? 600 : 400,
                          }}
                        >
                          {item.name}
                        </span>
                        {item.qty && (
                          <span
                            className="shrink-0 text-right"
                            style={{
                              fontSize: '12px',
                              color: '#8A8A8A',
                              minWidth: '72px',
                            }}
                          >
                            {item.qty}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
