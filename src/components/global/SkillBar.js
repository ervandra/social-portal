import React from "react";

const SkillBar = (props) => {
  const { lowColor, highColor, click, people, skills } = props;
  const hasSkillPoints = people.skillPoints.edges.length > 0;
  let totalPoints = 0;
  let maxPoints = 0;
  const hasSkills = skills.edges.length > 0;
  if (hasSkillPoints && hasSkills) {
    for (let c = 0; c < people.skillPoints.edges.length; c++) {
      const ssp = people.skillPoints.edges[c].node;
      const sspid = ssp.skill.id;
      if (skills.edges.findIndex(e => e.node.id === sspid) !== -1) {
        totalPoints += ssp.value;
        maxPoints += ssp.skill.stats.edges[0].node.maxValue;
      }
    }
  }
  const bgColor = totalPoints === 0 || maxPoints === 0 ? `#cccccc` : `${highColor}99`;
  const averagePoints = (totalPoints !== 0 && maxPoints !== 0) ? (totalPoints / maxPoints).toFixed(2) : 0;

  return (
    <div className="skill-bar-container" style={{ background: bgColor, borderColor: `${lowColor}66` }} onClick={click}>
      {people.skillPoints.edges.length > 0 && people.skillPoints.edges.map((sp, index) => {
        if (hasSkills && skills.edges.findIndex(e => e.node.id === sp.node.skill.id) === -1) return null;
        const currentValue = averagePoints !== 0 ? (((sp.node.value * 100) / totalPoints).toFixed(2) * averagePoints).toFixed(2) : 0;
        return (
          <div key={sp.node.id + index} className="skill-bar-item" style={{ width: `${currentValue}%`, background: `${lowColor}cc` }} title={`${sp.node.skill.title}: ${sp.node.value}pt`}></div>
        )
      })}
    </div>
  )
};

export default SkillBar;