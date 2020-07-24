import gql from 'graphql-tag';

export const getOrganisation = gql`
	query getOrganisation($name: String!) {
		organisations(name: $name) {
			edges {
				node {
					title
					name
				}
			}
		}
	}
`;

export const getSkills = gql`
	query getSkills($name: String!) {
		organisations (name: $name) {edges{node{
			id,
			title,
			name,
			skills { edges { node {
				id,
				title,
				imageUrl,
				userCount,
				value,
				averageValue
			}}}
		}}}
	}
`;

export const checkOrgUser = gql`
	query checkOrgUser($name: String!) {
		organisations (name: $name) {edges{node{
			isViewerAMember
		}}}
	}
`;

export const GET_PARTICIPANTS_POINTS = gql`
	query GET_PARTICIPANTS_POINTS{
		paths{edges{node{
			id,
			participants{edges{node{
				id,
				skillPoints{edges{node{
					id,
					value,
					target,
					skill{
						id
					}
				}}}
			}}}
		}}}
	}
`;

export const NEW_ENTERPRISE = gql`
	query NEW_ENTERPRISE {
		paths{edges{ cursor,
		 node{
			id,
			title,
			participants{edges{node{
				id,
				username,
				firstName,
				lastName,
				profilePictureUrl,
				profileBadgeUrl,
				bio,
				skillPointStats{edges{node{
					id,
					averageValue,
					skill{
						id,
						title
					}
				}}}
				skillPoints{edges{node{
					id,
					value,
					target,
					skill{
						id,
						title,
					}
				}}}
			}}}
		}}}
	}
`;

export const ENTERPRISE_PATHS = gql`
	query ENTERPRISE_PATHS {
		paths{edges{node{
			id,
			title,
			bgimage,
		}}}
	}
`;

export const ENTERPRISE_PARTICIPANTS = gql`
	query ENTERPRISE_PARTICIPANTS($pathId: ID!) {
		paths(id: $pathId){edges{node{
			id,
			title,
			participants{edges{node{
				id,
				username,
				lastName,
				firstName,
				profilePictureUrl,
				skills{edges{node{
					id,
					title,
					value,
					averageValue
				}}}
			}}}
		}}}
	}
`;

export const ENTERPRISE_SKILLS = gql`
	query ENTERPRISE_SKILLS($pathId: ID!) {
		paths(id: $pathId){edges{node{
			id,
			title,
			participants{edges{node{
				id,
				username,
				lastName,
				firstName,
				profilePictureUrl,
				skillPoints{edges{node{
					value,
					target,
					skill {
						id,
						title
					}
				}}}
				skillPointStats{edges{node{
					average
				}}}
			}}}
		}}}
	}
`;

export const ENTERPRISE_SKILL_INFO = gql`
	query ENTERPRISE_SKILL_INFO($skillId: ID!) {
		skills(id: $skillId){edges{node{
			id,
			title,
			userStats{edges{node{
				id
				value,
				target,
				user{
					username,
					firstName,
					lastName,
					profilePictureUrl,
				}
			}}}
			stats{edges{node{
				average
			}}}
		}}}
	}
`;

export const NE_SKILL_TARGET = gql`
	query NE_SKILL_TARGET($skillId: ID!){
		skills(id: $skillId){edges{node{
			id,
			title,
			imageUrl,
			stats{edges{node{
				maxValue,
				target,
				average,
				industryAverage,
				globalAverage
			}}}
		}}}
	}
`;

export const NEW_ENTERPRISE_DASHBOARD = gql`
	query NEW_ENTERPRISE_DASHBOARD($name: String!){
		organisations(name: $name) {edges{node{
			name,
			title,
			paths{edges{node{
				id,
				title,
				imageUrl
			}}}
			users{edges{node{
				id,
				username,
				firstName,
				lastName,
				profilePictureUrl,
				bio,
			}}}
			skills{edges{node{
				id,
				title,
				imageUrl,
				userCount,
				stats{edges{node{
					target,
					average,
					maxValue,
				}}}
				userStats{edges{node{
					value,
					target,
					user{
						id,
						username,
						firstName,
						lastName,
						profilePictureUrl,
					}
				}}}
			}}}
		}}}
	}
`;

export const NE_PATHS_PARTICIPANTS = gql`
	query NE_PATHS_PARTICIPANTS($pathId: ID!) {
		paths(id: $pathId){edges{node{
			id,
			title,
			participants{edges{node{
				id,
				username,
				firstName,
				lastName,
				profilePictureUrl,

				skillPoints{edges{node{
					id,
					value,
					target,
					skill{
						id,
						title,
						imageUrl,
						stats{edges{node{
							average,
							maxValue
						}}}
					}
				}}}

			}}}
		}}}
	}
`;

export const NE_PATH_FROM_SKILL = gql`
	query NE_PATH_FROM_SKILL($skillId: ID!){
		skills(id: $skillId){edges{node{
			id,
			title,
			paths{edges{node{
				id,
				title,
			}}}
		}}}
	}
`;

export const NE_SKILL_PARTICIPANTS = gql`
	query NE_SKILL_PARTICIPANTS($skillId: ID!){
		skills(id: $skillId){edges{node{
			id,
			title,
			userStats{edges{node{
				id
				value,
				target,
				user {
					id,
					username,
					firstName,
					lastName,
					profilePictureUrl,
				}
			}}}
			stats{edges{node{
				average,
				maxValue
			}}}
		}}}
	}
`;

export const NE_PATH_OF_ME = gql`
	query NE_PATH_OF_ME{
		paths{edges{node{
			id,
			title,
			imageUrl,
		}}}
	}
`;

export const NE_SKILL_INFO = gql`
	query NE_SKILL_INFO($skillId: ID!){
		skills(id: $skillId){edges{node{
			id,
			title,
			stats{edges{node{
				average
			}}}
		}}}
	}
`;

export const GET_ENTERPRISE_DASHBOARD = gql`
	query GET_ENTERPRISE_DASHBOARD($name: String!) {
		skillPointStats{edges{node{
			id,
			target,
			industryAverage,
			globalAverage,
			skill{
				id,
				title
			}
		}}}
		organisations (name: $name) {edges{node{
			id,
			title,
			name,
			paths { edges { node {
				id,
				title,
			}}}
			users { edges { node {
				id,
				username,
				firstName,
				lastName,
				profilePictureUrl,
				profileBadgeUrl,
				bio,
			}}}
			skills { edges { node {
				id,
				title,
				imageUrl,
				userCount,
				value,
				averageValue,
				paths { edges { node {
					id,
					title,
				}}}
			}}}
		}}}
	}
`;

export const getPaths = gql`
	query getPaths($name: String!, $skillId: ID!) {
		organisations(name: $name) { edges { node {
			id,
			title,
			name,
			skills(id: $skillId) { edges { node {
				id,
				title,
				imageUrl,
				userCount,
				averageValue,
				value
				socialKeyword,
				paths { edges { node {
					id,
					title,
					description,
					mentorName,
					imageUrl,
					mentorImageUrl,
					userCount,
					minColor,
					lowColor,
					highColor,
					maxColor,
					goUrl,
				} } }
			} } }
		} } }
	}
`;

export const GET_ORGANISATION_PATH = gql`
	query GET_ORGANISATION_PATH($name: String!, $pathId: ID!) {
		organisations(name: $name) { edges { node {
			id,
			title,
			name,
			paths(id: $pathId) { edges { node {
				id,
				title,
				description,
				mentorName,
				imageUrl,
				mentorImageUrl,
				userCount,
				minColor,
				lowColor,
				highColor,
				maxColor,
				goUrl
			} } }
		} } },
		viewer {
			paths(id: $pathId) { edges { node {
				id,
				title,
				description,
				mentorName,
				mentorImageUrl,
				userCount,
				minColor,
				lowColor,
				highColor,
				maxColor,
				bgimage,
				imageUrl,
				goUrl,
				steps { edges { node {
					id,
					title,
					description,
					questionsCount,
					completed
					owner {
						id,
						username,
						firstName,
						lastName,
						profilePictureUrl,
					},
					contents { edges { node {
						id,
						title,
						imageUrl,
						documentId,
						vuoBlocks{edges{node{
							id, type, hasAnswer
						}}},
						contentType,
						url,
						marketItem {
							id,
							isEnrolled,
							path {
								id,
								title,
								imageUrl,
								bgimage,
								mentorName,
								mentorImageUrl,
								description,
								goUrl,
								lowColor,
								highColor,
								minColor,
								maxColor,
								userCount,
							}
						}
					}}}
				}}}
			}}}
		}
	}
`;

export const getPathDetail = gql`
query getPathDetail($name: String!, $skillId: ID!, $pathId: ID!) {
	organisations (name: $name) { edges { node {
		id,
		title,
		name,
		skills (id: $skillId) { edges { node {
			id,
			title,
			imageUrl,
			userCount,
			socialKeyword,
			paths (id: $pathId) { edges { node {
				id,
				title,
				description,
				imageUrl,
				mentorName,
				mentorImageUrl,
				userCount,
				minColor,
				lowColor,
				highColor,
				maxColor,
				goUrl
			}}}
		}}}
	}}}
}
`;

export const getAuthPath = gql`
query getAuthPath($name: String!, $skillId: ID!, $pathId: ID!, $since: Float) {
	organisations(name: $name) { edges { node {
		id,
		title,
		name,
		skills (id: $skillId) { edges { node {
			id,
			title,
			imageUrl,
			userCount,
			socialKeyword,
			paths { edges { node {
				id,
				title,
				description,
				imageUrl,
				mentorName,
				mentorImageUrl,
				userCount,
				minColor,
				lowColor,
				highColor,
				maxColor,
				goUrl
			}}}
		}}}
	}}},
	mastodonTags(since: $since){
		id,
		name
	}
	viewer {
		paths(id: $pathId) { edges { node {
			tickerEnabled,
			canCreateBadge,
			canAssignBadge,
			mentorMastodonUsername,
			availableBadges{edges{node{
				id,
				url,
			}}}
			id,
			title,
			description,
			mentorName,
			mentorImageUrl,
			userCount,
			minColor,
			lowColor,
			highColor,
			maxColor,
			bgimage,
			imageUrl,
			goUrl,
			steps { edges { node {
				id,
				title,
				description,
				questionsCount,
				completed
				owner {
					id,
					username,
					firstName,
					lastName,
					profilePictureUrl,
				},
				contents { edges { node {
					id,
					title,
					imageUrl,
					documentId,
					vuoBlocks{edges{node{
							id, type, hasAnswer
						}}},
					contentType,
					url,
					marketItem {
							id,
							isEnrolled,
							path {
								id,
								title,
								imageUrl,
								bgimage,
								mentorName,
								mentorImageUrl,
								description,
								goUrl,
								lowColor,
								highColor,
								minColor,
								maxColor,
								userCount,
							}
						}
				}}}
			}}}
		}}}
	}
}
`;

export const getMyPaths = gql`
	query getMyPaths {
		viewer {
			paths {edges { node {
				id,
				title,
				bgimage,
				imageUrl,
				mentorName,
				mentorImageUrl,
				userCount
			}}}
		}
	}
`;
export const getMyTimeline = gql`
	query getMyTimeline($count: Int!, $cursor: String) {
	viewer{
		timelineEvents(first: $count, after: $cursor){edges{
			cursor,
			node{
				id,
				actor,
				excerpt,
				metadata1,
				metadata2,
				timestamp,
				senderType,
				senderId,
				name,
				contextType,
				contextId,
				targetType,
				targetId
			}
		},
		pageInfo{
			hasNextPage,
			endCursor
		}
		}
	}
}
`;

export const getAuthSkill = gql`
	query getAuthSkill {
		viewer {
			skills{edges{node{
				id,
				title,
				userCount,
				averageValue,
				value,
				socialKeyword,
				paths{edges{node{
					id,
					title,
					imageUrl,
					mentorName,
					mentorImageUrl,
					userCount
				}}}
			}}}
		}
	}
`;

export const GET_PATH_PARTICIPANTS_POINTS = gql`
	query GET_PATH_PARTICIPANTS_POINTS{
		paths{edges{node{
			id,
			participants{edges{node{
				id,
				username,
				skillPoints{edges{node{
					id,
					value,
					target,
					skill {
						id,
						title,
					}
				}}}
			}}}
		}}}
	}
`;

export const getPathParticipants = gql`
	query getPathParticipants($pathId: ID!, $count: Int!, $cursor: String!, $stringPathId: String){
		paths(id: $pathId){edges{node{
			id,
			canCreateBadge,
			canAssignBadge,
			participants(first: $count, after: $cursor, sortBy:"-path_skill_points"){edges{
				cursor,
				node{
				id,
				username
				firstName,
				lastName,
				profilePictureUrl,
				bio,
				profileBadgeUrl,
				skills(pathId: $stringPathId){edges{node{
					id,
					title,
					imageUrl,
					averageValue,
					value,
					stats{edges{node{
						maxValue,
					}}}
				}}}
				pathSkillsPoints(pathId: $stringPathId)
				skillPoints{edges{node{
					value,
					target,
					id,
					skill {
						id,
						title
						stats{edges{node{
							maxValue,
						}}}
						paths{edges{node{
							id,
						}}}
					}
				}}}
			}},
			pageInfo{
				hasNextPage,
				endCursor
			}}
		}}}
	}
`;

export const getUserPaths = gql`
	query getUserPaths{
		viewer{
			paths{edges{node{
				id,
				title,
				bgimage,
				imageUrl,
				mentorName,
				mentorImageUrl,
				userCount,
				steps{edges{node{
					id,
					contents{edges{node{
						id,
						documentId,
					}}}
				}}}
			}}}
		}
	}
`;

export const getSkillProgress = gql`
	query getSkillProgress($pathId: ID!){
		viewer{
			skills{edges{node{
				id,
				title,
				averageValue,
				value,
				paths(id: $pathId){edges{node{
					id
				}}}
			}}}
		}
	}
`;

export const GET_TICKERS = gql`
	query GET_TICKERS($pathId: ID!){
		viewer {
			id, username, firstName, lastName, profilePictureUrl,
			tickerSummary(course: $pathId){
				totalDays,
				weight, waist
			}
			tickers(course: $pathId){edges{node{
				id,
				title,
				value,
				timestamp,
				course {
					id,
					title,
				}
			}}}
		}
	}
`;

export const GET_FIRST_TICKER = gql`
	query GET_FIRST_TICKER($title: String, $pathId: ID){
		viewer {
			tickers(first:1, title:$title, course:$pathId){edges{node{
				id,
				value,
				title,
				timestamp
			}}}
		}
	}
`;

export const GET_LAST_TICKER = gql`
	query GET_LAST_TICKER($title: String, $pathId: ID){
		viewer{
			tickers(last: 1, title: $title, course: $pathId){edges{node{
				id,
				value,
				title,
				timestamp
			}}}
		}
	}
`;

export const INPUT_TICKER = gql`
  mutation tickerInput($clientMutationId: String!, $userId: String!, $courseId: String!, $title: String!, $value: Float!) {
		tickerInput(input:{ clientMutationId: $clientMutationId, userId:$userId, courseId: $courseId, title: $title, value: $value}){
    tickerNode {
      id,
			title,
      value,
			timestamp,
			user {
				username
			}
    },
    clientMutationId
  }
}
`;

export const getAuthPath2 = gql`
	query getAuthPath2($pathId: ID!, $stringPathId: String!, $since: Float) {
		viewer {
			isTickerEnabled(pathId: $pathId)
			pathCoach(pathId: $stringPathId){
				id,
				username,
				firstName,
				lastName,
				profilePictureUrl,
			}
			paths(id: $pathId){edges{node{
				tickerEnabled,
				availableMentors{edges{node{
					id,
					username,
					firstName,
					lastName,
					profilePictureUrl
				}}}
				mentorMastodonUsername,
				canCreateBadge,
				canAssignBadge,
				availableBadges{edges{node{
					id,
					url,
				}}}
				id,
				bgimage,
				imageUrl,
				lowColor,
				highColor,
				title,
				maxColor,
				goUrl,
				mentorName,
				mentorImageUrl,
				steps { edges { node {
					id,
					title,
					description,
					questionsCount,
					completed,
					owner {
						id,
						username,
						firstName,
						lastName,
						profilePictureUrl,
					},
					contents { edges { node {
						id,
						title,
						imageUrl,
						documentId,
						vuoBlocks{edges{node{
							id, type, hasAnswer
						}}},
						contentType,
						url,
						marketItem {
							id,
							isEnrolled,
							path {
								id,
								title,
								imageUrl,
								bgimage,
								mentorName,
								mentorImageUrl,
								description,
								goUrl,
								lowColor,
								highColor,
								minColor,
								maxColor,
								userCount,
							}
						}
					}}}
				}}}
			}}}
		}
		mastodonTags(since: $since){
			id,
			name
		}
	}
`;

export const getMyProfile = gql`
	query getMyProfile {
		viewer {
			username,
			firstName,
			lastName,
			profilePictureUrl,
			bio
			profileBadgeUrl,
			skills{edges{node{
				id,
				title,
				averageValue,
				value
			}}},
			paths{edges{
				node{
				id,
				title,
				mentorName,
				mentorImageUrl,
				userCount,
				bgimage,
				imageUrl,
				steps{edges{node{
					id,
					contents{edges{node{
						id,
						documentId,
					}}}
				}}}
			}}}
		},
		organisations { edges { node {
			name,
			title,
			skills {edges{node{
				id,
				title,
				averageValue,
				value,
			}}}
		}}}
	}
`;

export const getMyPathDetail = gql`
	query getMyPathDetail($pathId: ID!) {
		viewer {
			paths(id: $pathId) { edges { node {
				canCreateBadge,
				canAssignBadge,
				availableBadges{edges{node{
					id,
					url,
				}}}
				id,
				title,
				description,
				mentorName,
				mentorImageUrl,
				userCount,
				minColor,
				lowColor,
				highColor,
				maxColor,
				bgimage,
				imageUrl,
				goUrl,
				steps { edges { node {
					id,
					title,
					description,
					questionsCount,
					owner {
						id,
						username,
						firstName,
						lastName,
						profilePictureUrl,
					},
					contents { edges { node {
						id,
						title,
						imageUrl,
						documentId,
						vuoBlocks{edges{node{
							id, type, hasAnswer
						}}},
						contentType,
						url,
						marketItem {
							id,
							isEnrolled,
							path {
								id,
								title,
								imageUrl,
								bgimage,
								mentorName,
								mentorImageUrl,
								description,
								goUrl,
								lowColor,
								highColor,
								minColor,
								maxColor,
								userCount,
							}
						}
					}}}
				}}}
			}}}
		}
	}
`;

export const getVuoDocument = gql`
	query getVuoDocument($pathId: ID!) {
		viewer {
			paths(id: $pathId) { edges { node {
				id,
				title
				steps { edges { node {
					id
					contents { edges { node {
						id,
						title,
						documentId,
						vuoBlocks{edges{node{
							id, type, hasAnswer
						}}},
						contentType,
						marketItem {
							id,
							isEnrolled,
							path {
								id,
								title,
								imageUrl,
								bgimage,
								mentorName,
								mentorImageUrl,
								description,
								goUrl,
								lowColor,
								highColor,
								minColor,
								maxColor,
								userCount,
							}
						}
					}}}
				}}}
			}}}
		}
	}
`;

export const getPathDetail2 = gql`
	query getPaths($name: String!) {
		organisations(name: $name) {
			edges {
				node {
					title
					name
					skills {
						edges {
							node {
								title
								id
								imageUrl
								userCount
								socialKeyword,
								paths {
									edges {
										node {
											title
											id
											mentorName
											description
											lowColor
											highColor
											minColor
											maxColor
											goUrl
                      imageUrl
                      userCount,
											steps{edges{node{
												contents{edges{node{
													vuoBlocks{edges{node{
														id,type,hasAnswer
													}}}
												}}}
											}}}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;

export const getNavigation = gql`
	query getNavigation($name: String!) {
    viewer {
      username
    }
		organisations(name: $name) {
			edges {
				node {
					title
					name
					skills {
						edges {
							node {
								title
								id
								paths {
									edges {
										node {
											title
											id
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;

export const ENROLL = gql`
	mutation enrollement($clientMutationId: String!, $shareCode: String!) {
		enroll(input:{ clientMutationId: $clientMutationId, sharecode: $shareCode }){
			clientMutationId,
			status,
			enrollMarketItem2{
				id,
				isEnrolled,
				title,
				sellableId,
				itemType,
				price,
				currency,
			}
		}
	}
`;

export const COMPLETE_STEP = gql`
  mutation completeStep($clientMutationId: String!, $stepId: String!, $isCompleted: Boolean!) {
  completeStep(input:{ clientMutationId: $clientMutationId, step:$stepId, isCompleted: $isCompleted}){
    step {
      id
      completed
    },
    clientMutationId
  }
}
`;

export const SET_ORG_SKILL_TARGET = gql`
  mutation setSkillTarget($clientMutationId: String!, $skillId: String!, $target: String!) {
		  setSkillTarget(input:{ clientMutationId: $clientMutationId,, skillId:$skillId, target: $target}){
			clientMutationId,
			skillpointstatsNode{
				id,
				target,
				skill{
					title
				}
  		}
		}
	}
`;

export const SET_PERSONAL_TARGET = gql`
  mutation setPersonalSkillTarget($clientMutationId: String!, $userId: String!, $skillId: String!, $target: String!) {
		setPersonalSkillTarget(input:{ clientMutationId: $clientMutationId, userId: $userId, skillId:$skillId, target: $target}){
			clientMutationId,
			userskillpointsNode{
				id,
				value,
				target,
				skill{
					title
				}

  		}
		}
	}
`;

export const ASSIGN_BADGE = gql`
	mutation assignUserBadge($clientMutationId: String!, $userId: String!, $badgeId: String!){
		assignUserBadge(input: {clientMutationId: $clientMutationId, userId: $userId, badgeId: $badgeId}) {
			clientMutationId,
			userNode{
				id,
				username,
				profileBadgeUrl,
			}
		}
	}
`;

export const CREATE_BADGE = gql`
	mutation createUserBadge($clientMutationId: String!, $imgUrl: String!, $pathId: String!){
		createUserBadge(input: {clientMutationId: $clientMutationId, imgUrl: $imgUrl, pathId: $pathId}) {
			clientMutationId,
			badgeNode{
				id,
				url,
			}
		}
	}
`;

export const GET_TIMELINE = gql`
  query GET_TIMELINE($count: Int!, $cursor: String) {
		viewer{
			timelineEvents(first: $count, after: $cursor){edges{
				cursor,
				node{
					id,
					actor,
					excerpt,
					metadata1,
					metadata2,
					timestamp,
					senderType,
					senderId,
					name,
					contextType,
					contextId,
					targetType,
					targetId
				}
			},
			pageInfo{
				hasNextPage,
				endCursor
			}
			}
		}
	}
`;

export const VIEWER_SKILL_POINTS = gql`
	query VIEWER_SKILL_POINTS{
		viewer{
			id
			skills{edges{node{
				id,
				title,
				imageUrl,
				userStats{edges{node{
					value,
					target,
					user {
						id,
						username,
						firstName,
					}
				}}}
				stats{edges{node{
					average,
					target,
				}}}
			}}}
		}
		skillPointStats{edges{node{
			target,
			skill{
				id,
				title
			}
		}}}
		userSkillPoints{edges{node{
			id,
			value,
			target,
			user{
				id,
				firstName,
				lastName,
				username
			}
			skill{
				id,
				title,
				imageUrl,
				stats{edges{node{
					target,
					maxValue,
					average,
					industryAverage,
					globalAverage,
				}}}
			}
		}}}
	}
`;

export const GET_MAX_SKILL_VALUE = gql`
	query GET_MAX_SKILL_VALUE($skillId: ID!){
		skills(id: $skillId){edges{node{
			id,
			title,
			stats{edges{node{
				maxValue,
			}}}
		}}}
	}
`;

export const GET_COACH_DISCUSSION = gql`
	query GET_COACH_DISCUSSION($pathId: String!){
		viewer {
			tickerConversations(pathId: $pathId) {
        edges {
          node {
            tags
            username
            updatedAt
            text
          }
        }
      }
		}
	}
`;

export const SET_COACH = gql`
  mutation setCoach($pathId: String!, $coachId: String!){
		setCoach(input: { clientMutationId: "set coach for this path", pathId: $pathId, coachId: $coachId}) {
			clientMutationId,
			coachNode {
				id
				username,
				firstName,
				lastName,
				profilePictureUrl,
			}
		}
	}
`;

export const GET_MENTORED_PARTICIPANTS = gql`
	query GET_MENTORED_PARTICIPANTS($pathId: ID!){
		paths(id: $pathId){edges{node{
			id,
			title,
			mentoredParticipants{edges{node{
				id,
				username,
				firstName,
				lastName,
				tickerSummary(course: $pathId){
					totalDays,
					weight, waist
				},
				tickers(course: $pathId){edges{node{
					id,
					title,
					value,
					timestamp,
					course {
						id,
						title,
					}
				}}}
			}}}
		}}}
	}
`;