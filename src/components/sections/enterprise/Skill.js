import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';

class Skill extends Component {
	state = {
		sData: [...this.props.data],
		sort: true,
	}


	changeSort = () => {
		const { sort } = this.state;
		this.setState({
			sort: !sort
		})
	}

	render() {
		const { sData, sort } = this.state;
		const { t } = this.props;
		const sortedSkills = sData ? sData.sort((a, b) => sort ? b.node.value - a.node.value : a.node.value - b.node.value) : [];
		return (
			<div className="enterprise-box">
				<React.Fragment>
					<div className="sort-skill">
						<span className="text">{t('sort')}: </span>
						{sort ? (
							<a role="button" onClick={this.changeSort}><span className="fa fa-sort-amount-desc"></span></a>
						) : (
								<a role="button" onClick={this.changeSort}><span className="fa fa-sort-amount-asc"></span></a>
							)}
					</div>
					{sortedSkills && sortedSkills.length > 0 && (
						<div className="ed-progress-bar">
							{sortedSkills.map((sp, index) => {
								const { value, skill } = sp.node;
								return (

									<div className="progress-item" key={skill.id + index}>
										<div className="target-bar target-top" style={{ width: '100%' }}></div>
										<div className="target-bar target-organisation" style={{ width: `100%` }}></div>
										<div className="target-bar target-users" style={{ width: `100%` }}></div>
										<div className="target-text">{skill.title} <strong>{value} pt</strong></div>
									</div>

								)
							})}
						</div>
					)}
				</React.Fragment>
			</div>
		)
	}
};

export default withTranslation()(Skill);
