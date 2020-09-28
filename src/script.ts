const loadTokenFromChromeStorage = (): Promise<string> =>
  new Promise((resolve) => {
    chrome.storage.sync.get(["token"], ({ token }) => {
      resolve(token);
    });
  });

const init = async () => {
  const token = await loadTokenFromChromeStorage();

  if (token === "") {
    return console.warn(
      "Groam: Please specify a personal access token via the options page."
    );
  }

  const [
    blank,
    repoOwner,
    repoName,
    issues,
    issueNumber,
  ] = window.location.pathname.split("/");

  let references = [];

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({
        query: `{
          repository(owner: "${repoOwner}", name: "${repoName}") {
            issue(number: ${issueNumber}) {
              timelineItems(first:250, itemTypes:[CROSS_REFERENCED_EVENT]) {
                nodes {
                  ... on CrossReferencedEvent {
                    actor {
                      login
                      url
                    }
                    source {
                      ... on Issue {
                        number
                        title
                        url
                      }
                      ... on PullRequest {
                        title
                        number
                        state
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      }),
    });

    const responseJson = await response.json();

    references = responseJson?.data?.repository?.issue?.timelineItems?.nodes;
  } catch (error) {
    return console.error(`Groam: ${error.message}`);
  }

  if (references.length === 0) {
    return console.info("Groam: No issue references found.");
  }

  const linkedReferences = document.createElement("details");

  linkedReferences.innerHTML = `
  <summary>
    🔗 References
  </summary>
  <br/>
  <table role="table">
  <thead>
  <tr>
  <th>From</th>
  <th>By</th>
  <th>Link</th>
  </tr>
  </thead>
  <tbody>
  ${references
    .map(
      (d) =>
        `<tr><td>${d.source.state ? "PR" : "Issue"}</td><td><a href="${
          d.actor.url
        }">${d.actor.login}</a></td><td><a href="${d.source.url}">${
          d.source.title
        } (#${d.source.number})</td></tr>`
    )
    .join("")}
  </tbody>
  </table>
  `;

  document
    .getElementsByClassName("comment-body")[0]
    .appendChild(linkedReferences);
};

init();
