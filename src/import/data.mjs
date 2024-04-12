// import "reflect-metadata";
import mysql from 'mysql2/promise';
import fetch from 'node-fetch';
import { toMysqlFriendlyDatetime } from '../helpers/date-helpers.mjs';

// Create the connection to database
const connection = await mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PW,
});
connection.config.namedPlaceholders = true;

// TODO: Use migrations and ORM for all of this db creation
console.log('Creating database');
await connection.query('create database if not exists `supa`');

console.log('use?');
await connection.query('use `supa`');

console.log('Creating user table');
await connection.query(`create table if not exists supa.HeadlightUsers
                        (
                            id int not null auto_increment,
                            email varchar(100) null,
                            githubUsername varchar(100) null,
                            jiraUserID varchar(100) null,
                            name varchar(100) null,
                            lastRanForDate datetime null,
                            isSenior     bool      null,
                            disabledDate     datetime    null,
                            PRIMARY KEY (id)
                        );
`);

// Insert headlight users
const headlightUsers = [
  {
    email: null,
    name: "Amber Aftab",
    isSenior: false,
    githubUsername: "amber-aftab",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Andrew McDaniel",
    isSenior: false,
    githubUsername: "amcdaniel-pavia",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Andrei Pashkov",
    isSenior: false,
    githubUsername: "andrei-headlight",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Becky Dudley",
    isSenior: false,
    githubUsername: "beckyd32",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Alex Decker",
    isSenior: true,
    githubUsername: "bigal-hl",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Brock Ackley",
    isSenior: false,
    githubUsername: "Brock-oly",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Jackson Pollard",
    isSenior: false,
    githubUsername: "JackPollHeadlight",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Karl Maurrasse",
    isSenior: true,
    githubUsername: "kamaurra-headlight",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Cesar Vargas",
    isSenior: true,
    githubUsername: "limitlis",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Iryna Maslova",
    isSenior: true,
    githubUsername: "maslovai",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Doug Greene",
    isSenior: true,
    githubUsername: "Nineafterten",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Ned Stuart",
    isSenior: true,
    githubUsername: "nsheadlight",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Paula Mookerjee",
    isSenior: false,
    githubUsername: "Pmookerjee",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Roopa RozarioMariathasan",
    isSenior: false,
    githubUsername: "RoopaRM",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Ryo Tulman",
    isSenior: false,
    githubUsername: "ryot",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Sam Watson",
    isSenior: false,
    githubUsername: "samwatson-headlight",
    jiraUserID: null,
  },
  {
    email: null,
    name: "Simon Mendoza",
    isSenior: false,
    githubUsername: "simonthefox",
    jiraUserID: null,
  },
  {
    email: "steven.velozo@headlight.com",
    name: "Steve Velozo",
    isSenior: true,
    githubUsername: "stevenvelozo",
    jiraUserID: null,
  },
  {
    email: "zack.warren@headlight.com",
    name: "Zack Warren",
    isSenior: false,
    githubUsername: "zack-warren-headlight",
    jiraUserID: null,
  },
];
console.log('Inserting headlight user records');
for (let user of headlightUsers) {
  // Try Update, if no rows updated, Insert instead
  const [res, fields] = await connection.query(`
    UPDATE supa.HeadlightUsers SET 
      email = ?,
      githubUsername = ?,
      jiraUserID = ?,
      isSenior = ?
    WHERE name = ?`,
    [user.email, user.githubUsername, user.jiraUserID, user.isSenior, user.name]  
  );
  if (res.affectedRows === 0) {
    await connection.query(`
      INSERT INTO supa.HeadlightUsers (
        email,
        githubUsername,
        jiraUserID,
        isSenior,
        name
      ) VALUES (
        ?, ?, ?, ?, ?
      )`,
      [user.email, user.githubUsername, user.jiraUserID, user.isSenior, user.name]  
    );
  }
}

console.log('Creating GithubYearlyData table');
await connection.query(`create table if not exists supa.GithubYearlyContributions
                        (
                            userID int not null,
                            startedAt datetime null,
                            endedAt datetime null,
                            totalCommitContributions int null,
                            totalIssueContributions int null,
                            totalPullRequestContributions int null,
                            totalPullRequestReviewContributions int null,
                            totalRepositoryContributions int null,
                            totalRepositoriesWithContributedCommits int null,
                            totalRepositoriesWithContributedIssues int null,
                            totalRepositoriesWithContributedPullRequestReviews int null,
                            totalRepositoriesWithContributedPullRequests int null,
                            FOREIGN KEY (userID) REFERENCES supa.HeadlightUsers(id),
                            CONSTRAINT userID UNIQUE (userID)
                        );
`);

console.log('Creating GithubDailyData table');
await connection.query(`create table if not exists supa.GithubDailyContributions
                        (
                            userID int not null,
                            date     datetime    null,
                            contributionCount  int         null,
                            FOREIGN KEY (userID) REFERENCES supa.HeadlightUsers(id),
                            constraint user_day unique (userID, date)
                        );
`);

console.log('Creating GithubCommits table');
await connection.query(`create table if not exists supa.GithubCommits
                        (
                            commitID varchar(100) not null,
                            userID int not null,
                            date     datetime    null,
                            additions integer null,
                            deletions integer null,
                            changedFiles integer null,
                            FOREIGN KEY (userID) REFERENCES supa.HeadlightUsers(id),
                            PRIMARY KEY (commitID)
                        );
`);

const [users, fields] = await connection.query(`
  SELECT
    id, email, githubUsername, jiraUserID, name, lastRanForDate, isSenior, disabledDate
  FROM
    supa.HeadlightUsers
    `);

for(let user of users) {
  console.log('Fetching Github Contribution Data ', user.githubUsername);
  const res = await queryGithubData(user.githubUsername);

  if (res.data !== null) {
    const contributionsCollection = res.data.user.contributionsCollection;
    // Update yearly contributions
    await connection.query(`
      INSERT INTO supa.GithubYearlyContributions (
        userID,
        startedAt,
        endedAt,
        totalCommitContributions,
        totalIssueContributions,
        totalPullRequestContributions,
        totalPullRequestReviewContributions,
        totalRepositoriesWithContributedCommits,
        totalRepositoriesWithContributedIssues,
        totalRepositoriesWithContributedPullRequestReviews,
        totalRepositoriesWithContributedPullRequests,
        totalRepositoryContributions
      )
      VALUES (
        :userID,
        CONVERT(:startedAt, DATE),
        CONVERT(:endedAt, DATE),
        :totalCommitContributions,
        :totalIssueContributions,
        :totalPullRequestContributions,
        :totalPullRequestReviewContributions,
        :totalRepositoriesWithContributedCommits,
        :totalRepositoriesWithContributedIssues,
        :totalRepositoriesWithContributedPullRequestReviews,
        :totalRepositoriesWithContributedPullRequests,
        :totalRepositoryContributions
      )
      ON DUPLICATE KEY UPDATE
        startedAt = CONVERT(:startedAt, DATE),
        endedAt = CONVERT(:endedAt, DATE),
        totalCommitContributions = :totalCommitContributions,
        totalIssueContributions = :totalIssueContributions,
        totalPullRequestContributions = :totalPullRequestContributions,
        totalPullRequestReviewContributions = :totalPullRequestReviewContributions,
        totalRepositoriesWithContributedCommits = :totalRepositoriesWithContributedCommits,
        totalRepositoriesWithContributedIssues = :totalRepositoriesWithContributedIssues,
        totalRepositoriesWithContributedPullRequestReviews = :totalRepositoriesWithContributedPullRequestReviews,
        totalRepositoriesWithContributedPullRequests = :totalRepositoriesWithContributedPullRequests,
        totalRepositoryContributions = :totalRepositoryContributions
      `,
      {
        userID: user.id,
        startedAt: toMysqlFriendlyDatetime(contributionsCollection.startedAt),
        endedAt: toMysqlFriendlyDatetime(contributionsCollection.endedAt),
        totalCommitContributions: contributionsCollection.totalCommitContributions,
        totalIssueContributions: contributionsCollection.totalIssueContributions,
        totalPullRequestContributions: contributionsCollection.totalPullRequestContributions,
        totalPullRequestReviewContributions: contributionsCollection.totalPullRequestReviewContributions,
        totalRepositoriesWithContributedCommits: contributionsCollection.totalRepositoriesWithContributedCommits,
        totalRepositoriesWithContributedIssues: contributionsCollection.totalRepositoriesWithContributedIssues,
        totalRepositoriesWithContributedPullRequestReviews: contributionsCollection.totalRepositoriesWithContributedPullRequestReviews,
        totalRepositoriesWithContributedPullRequests: contributionsCollection.totalRepositoriesWithContributedPullRequests,
        totalRepositoryContributions: contributionsCollection.totalRepositoryContributions
      }
    );
  
    // Update daily contributions
    for(let week of contributionsCollection.contributionCalendar.weeks) {
      for(let day of week.contributionDays) {
        await connection.query(
          'INSERT INTO supa.GithubDailyContributions (userID, date, contributionCount) VALUES (?, CONVERT(?, DATE), ?) ON DUPLICATE KEY UPDATE `contributionCount` = ?',
          [user.id, day.date, day.contributionCount, day.contributionCount]
        );
      }
    }
  }

  // Git commit data, gather some stats
  const commitRes = await queryGithubCommits(user.githubUsername);
  // console.log(JSON.stringify(commitRes));
  if (commitRes.data !== null) {
    for (let repos of commitRes.data.user.repositoriesContributedTo.nodes) {
      for (let commit of repos.refs.nodes) {
        await connection.query(
          'INSERT INTO supa.GithubCommits (userID, commitID, date, additions, deletions, changedFiles) VALUES (?, ?, CONVERT(?, DATETIME), ?, ?, ?) ON DUPLICATE KEY UPDATE commitID = ?',
          [user.id, commit.target.id, toMysqlFriendlyDatetime(commit.target.committedDate), commit.target.additions, commit.target.deletions, commit.target.changedFilesIfAvailable, commit.target.id]
        )
      }
    }
  }

  // Update lastRanForDate date for the user
  await connection.query(
    `UPDATE supa.HeadlightUsers SET lastRanForDate = ? WHERE id = ?`,
    [toMysqlFriendlyDatetime(Date.now()), user.id]
  );
}


async function queryGithubData(user) {

	return await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			Authorization: `bearer ${process.env.HEADLIGHT_GITHUB_API_KEY}`
		},
		body: JSON.stringify({
			query: `query($userName:String = "${user}") { 
                user(login: $userName){
                  contributionsCollection {
                    startedAt
                    endedAt
                    totalCommitContributions
                    totalIssueContributions
                    totalPullRequestContributions
                    totalPullRequestReviewContributions
                    totalRepositoryContributions
                    totalRepositoriesWithContributedCommits
                    totalRepositoriesWithContributedIssues
                    totalRepositoriesWithContributedPullRequestReviews
                    totalRepositoriesWithContributedPullRequests
                    contributionCalendar {
                      totalContributions
                      weeks {
                        contributionDays {
                          contributionCount
                          date
                        }
                      }
                    }
                  }
                }
              }`
		}),
	})
		.then(response => response.json())
    ;
}

async function queryGithubCommits(user) {

	return await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			Authorization: `bearer ${process.env.HEADLIGHT_GITHUB_API_KEY}`
		},
		body: JSON.stringify({
			query: `query (
        $cursorRepo: String,
        $user: String = "${user}"
      ) {
        user(login: $user) {
          repositoriesContributedTo(
            includeUserRepositories: true
            contributionTypes: COMMIT
            first: 100
            after: $cursorRepo
          ) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
              refs (refPrefix: "refs/heads/", first: 100) {
                nodes {
                  target {
                    ... on Commit {
                      id
                      additions
                      changedFilesIfAvailable
                      committedDate
                      deletions
                      status {
                        contexts {
                          context
                          description
                          state
                        }
                        state
                      }
                      url
                      committedDate
                    }
                  }
                }
              }
            }
          }
        }
      }`
		}),
	})
		.then(response => response.json())
    ;
}

connection.close();