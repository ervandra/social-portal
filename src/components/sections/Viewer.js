import React, { Component } from 'react';

class Viewer extends Component {
	render() {
		return (
			<div className="path-viewer">
				<div className="grid-x">
					<div className="cell small-6 medium-5 large-4" />

					<div className="cell small-6 medium-7 large-8">
						<div className="document-viewer">
							<h1>We are communities of learning</h1>
							<p>
								While access to learning material is important, it is no longer that much of a
								challenge. Wikimedia Foundation has been liberating the collective knowledge of
								humankind since 2003 and doing a very good job of it.
							</p>
							<img
								src="http://lifelearnplatform.com/wp-content/uploads/2017/04/ll_website_uniqueskills_2.jpg"
								alt="Lifelearn"
							/>
							<p>
								But learning about the difficult topics, gaining deep understanding, and being able to
								apply that understanding to solving new problems in new contexts? That cannot be learned
								from just materials. You need other people, discussions, debates, practice, creation,
								reflection and feedback. And that is what LifeLearn is focusing on.
							</p>
							<h2>We are MyData: you own what you produce</h2>
							<p>
								We are the first company in the world to make a public MyData pledge. We promise that
								all data, all content, all analytics about you will belong to you and be under your
								control. Read more.
							</p>
							<h3>We are an open platform</h3>
							<p>
								To cater for learning in all walks of life, we cannot hope to create everything that is
								needed. Therefore we are building a platform with APIs, where others can connect and
								bring their own services, content, and products to LifeLearn. We can see advanced peer
								review services, content libraries, assessment tools, questionnaires, educational games,
								event tools, and similar finding a place in LifeLearn, where mentors and learners can
								use them to further their learning opportunities.
							</p>
							<p>
								We welcome both open and free services as well as commercial offerings onto our
								platform.
							</p>
							<p>
								We list a few examples of learning that has been made possible with LifeLearn. Many of
								our customers are not public yet, so details are limited.
							</p>

							<p>
								University teaching and CPD outreach. In Finland LifeLearn has enabled video based peer
								reflection in a trusted and secure environment to enhance kindergarten teacher training
								both for students and for in-practice teachers. In Singapore LifeLearn allows for
								communities of professional practice to come together online and recommend and support
								each other in acquiring new skills relevant to their field. In Cambodia, the best
								available university knowledge on midwife skills is brought to rural areas, helping
								reduce child and mother mortality.
							</p>

							<p>
								Traditional craftsmanship skills. Blacksmith farriers in Finland have taken a digital
								leap, and taken their age-old master-apprenticeship model onto LifeLearn, where veteran
								train novices and share their decades of experience and insight. Skill portfolios and
								skill competitions allow new professionals to become proficient faster and also to show
								their competence to their peers and to their future customers.
							</p>
							<p>
								Primary schools reaching out to society. Teachers and pupils in Finland are inviting
								parents, friends, and other relevant people to their skill paths, to involve them in the
								learning process and to contribute to it. LifeLearn allows a protected community to
								invite external visitors when needed, without a hassle with account and permission
								settings.
							</p>
							<p>
								Teachers reinventing their practice. Teachers in Indonesia are building a new digital
								age curriculum on LifeLearn as a community process. Teacher trainers are travelling the
								country, but now all teachers they meet can join online communities to keep learning,
								asking, helping and getting helped.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Viewer;
