import React from "react";

const ParticipantSkills = (props) => {
  const { lowColor, highColor, people, skills } = props;
  const hasSkillPoints = people.skillPoints.edges.length > 0;
  const hasSkills = skills.edges.length > 0;
  let totalPoints = 0;
  if (hasSkillPoints && hasSkills) {
    for (let c = 0; c < people.skillPoints.edges.length; c++) {
      const ssp = people.skillPoints.edges[c].node;
      const sspid = ssp.skill.id;
      if (skills.edges.findIndex(e => e.node.id === sspid) !== -1) {
        totalPoints += ssp.value;
      }
    }
  }
  const bgColor = totalPoints === 0 ? `#cccccc` : `${highColor}33`;
  return (
    <div className="participant-skill-container">
      {people.skillPoints.edges.length > 0 && people.skillPoints.edges.map((sp, index) => {
        if (!hasSkills || (hasSkills && skills.edges.findIndex(e => e.node.id === sp.node.skill.id) === -1)) return null;

        const skillIndex = skills.edges.findIndex(e => e.node.id === sp.node.skill.id);

        const maxValue = skillIndex !== -1 ? skills.edges[skillIndex].node.stats.edges[0].node.maxValue : sp.node.value;
        const myValue = skillIndex !== -1 ? (sp.node.value * 100 / maxValue).toFixed(2) : sp.node.value;

        return (
          <div key={sp.node.id + index} className="participant-skill-item" style={{ background: bgColor, borderColor: lowColor }} title={`${sp.node.skill.title}: ${sp.node.value} / ${maxValue} pt`}>
            <div className="skill-meter" style={{ width: `${myValue}%`, background: highColor }}></div>
            <div className="skill-name" style={{ color: lowColor }}>{`${sp.node.skill.title}: ${sp.node.value} pt`}</div>
          </div>
        )
      })}
    </div>
  )
};

export default ParticipantSkills;