import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class PublicSkillGrid extends Component {
	render() {
		return (
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
						{this.props.skill.node.value > 0 &&
							<div className="skill-progress-bar">
								<div className="skill-progress-meter">
									<div className="progress-average-value" style={{ width: `${this.props.skill.node.averageValue * 100}%` }} />
									<div className="progress-value" style={{ width: `${this.props.skill.node.value * 100}%` }} />
								</div>
							</div>
						}
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
		);
	}
}

export default PublicSkillGrid;
