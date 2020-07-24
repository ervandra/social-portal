import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import { Card } from 'semantic-ui-react';

class SkillGrid extends Component {
	render() {
		return (
			<div className="card">
				<div className="skill">
					<div className="skill_img">
						<Link
							to={`/${this.props.organisation.name}/${this.props.skill.node.id}`}
							title={this.props.skill.node.title}
						>
							{this.props.skill.node.imageUrl && (
								<img
									src={this.props.skill.node.imageUrl}
									alt={this.props.skill.node.title}
									width="250"
									height="250"
								/>
							)}
							<div className="skill-progress-bar">
								<div className="skill-progress-meter">
									{this.props.skill.node.averageValue > 0 &&
										<div className="progress-average-value" style={{ width: `${this.props.skill.node.averageValue * 100}%` }} />
									}
									{this.props.skill.node.averageValue > 0 && (
										<div className="progress-value" style={{ width: `${(this.props.skill.node.averageValue / 1.5) * 100}%` }} />
									)}
								</div>
							</div>
						</Link>
					</div>
					<div className="skill_info">
						<h3>
							<Link
								to={`/${this.props.organisation.name}/${this.props.skill.node.id}`}
								title={this.props.skill.node.title}
							>
								{this.props.skill.node.title}
							</Link>
						</h3>
					</div>
				</div>
			</div>
		);
	}
}

export default SkillGrid;
