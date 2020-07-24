import React from 'react';
import SkillProgress from '../global/SkillProgress';
import { withTranslation } from 'react-i18next';

const SkillContent = props => {
	const { data, t } = props;
	return (
		<div className="landing-skill">
			<h4>{data.userCount}</h4>
			{data.value > 0 ?
				<React.Fragment>
					<p>{t('skillHasValueText1')}</p>
					<div className="grid-x grid-margin-x align-center">
						<div className="cell small-12 medium-6 large-4"><SkillProgress averageValue={data.averageValue} value={data.value} title={data.title} /></div>
					</div>
					<p>{t('skillHasValueText2')}</p>
				</React.Fragment>
				:
				<React.Fragment>
					<p>{t('skillDontHaveValueText')}</p>
				</React.Fragment>
			}
		</div>
	)
};

export default withTranslation()(SkillContent);
