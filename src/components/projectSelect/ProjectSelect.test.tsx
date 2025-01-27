import { MockedProvider } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";
import { getCommitsRoute, getProjectSettingsRoute } from "constants/routes";
import { RenderFakeToastContext } from "context/__mocks__/toast";
import { GET_PROJECTS, GET_VIEWABLE_PROJECTS } from "gql/queries";
import { renderWithRouterMatch, screen, waitFor } from "test_utils";

import { ProjectSelect } from ".";

describe("projectSelect", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sets the currently selected project to what ever is passed in's display name", async () => {
    const { Component } = RenderFakeToastContext(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectSelect
          selectedProjectIdentifier="evergreen"
          getRoute={getCommitsRoute}
        />
      </MockedProvider>
    );

    const { baseElement } = renderWithRouterMatch(<Component />);
    await waitFor(() => {
      expect(baseElement).toHaveTextContent("evergreen smoke test");
    });
  });

  it("should toggle dropdown when clicking on it", async () => {
    const { Component } = RenderFakeToastContext(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectSelect
          selectedProjectIdentifier="evergreen"
          getRoute={getCommitsRoute}
        />
      </MockedProvider>
    );
    renderWithRouterMatch(<Component />);

    await waitFor(() => {
      expect(screen.getByDataCy("project-select")).toBeInTheDocument();
    });

    expect(
      screen.queryByDataCy("project-select-options")
    ).not.toBeInTheDocument();
    userEvent.click(screen.queryByDataCy("project-select"));
    expect(screen.getByDataCy("project-select-options")).toBeInTheDocument();
    userEvent.click(screen.queryByDataCy("project-select"));
    expect(
      screen.queryByDataCy("project-select-options")
    ).not.toBeInTheDocument();
  });

  it("should narrow down search results when filtering on projects", async () => {
    const { Component } = RenderFakeToastContext(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectSelect
          selectedProjectIdentifier="evergreen"
          getRoute={getCommitsRoute}
        />
      </MockedProvider>
    );
    renderWithRouterMatch(<Component />);

    await waitFor(() => {
      expect(screen.getByDataCy("project-select")).toBeInTheDocument();
    });

    expect(
      screen.queryByDataCy("project-select-options")
    ).not.toBeInTheDocument();
    userEvent.click(screen.queryByDataCy("project-select"));
    expect(screen.getByDataCy("project-select-options")).toBeInTheDocument();
    let options = await screen.findAllByDataCy("project-display-name");
    expect(options).toHaveLength(6);
    userEvent.type(
      screen.queryByDataCy("project-select-search-input"),
      "logkeeper"
    );
    options = await screen.findAllByDataCy("project-display-name");
    expect(options).toHaveLength(1);
  });
});

describe("projectSelect for project settings", () => {
  it("shows disabled projects at the bottom of the list", async () => {
    const { Component } = RenderFakeToastContext(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectSelect
          selectedProjectIdentifier="evergreen"
          getRoute={getProjectSettingsRoute}
          isProjectSettingsPage
        />
      </MockedProvider>
    );
    renderWithRouterMatch(<Component />);

    await waitFor(() => {
      expect(screen.getByDataCy("project-select")).toBeInTheDocument();
    });

    expect(
      screen.queryByDataCy("project-select-options")
    ).not.toBeInTheDocument();
    userEvent.click(screen.queryByDataCy("project-select"));
    expect(screen.getByDataCy("project-select-options")).toBeInTheDocument();
    const options = await screen.findAllByDataCy("project-display-name");
    expect(options).toHaveLength(4);

    // Disabled project appears last
    expect(options[3]).toHaveTextContent("evergreen smoke test");
    expect(screen.getByText("Disabled Projects")).toBeInTheDocument();

    // Favorited projects should appear twice
    expect(screen.getAllByText("logkeeper")).toHaveLength(2);
  });

  it("does not show a heading for disabled projects when all projects are enabled", async () => {
    const { Component } = RenderFakeToastContext(
      <MockedProvider mocks={[mocks[2]]} addTypename={false}>
        <ProjectSelect
          selectedProjectIdentifier="spruce"
          getRoute={getProjectSettingsRoute}
          isProjectSettingsPage
        />
      </MockedProvider>
    );
    renderWithRouterMatch(<Component />);

    await waitFor(() => {
      expect(screen.getByDataCy("project-select")).toBeInTheDocument();
    });

    expect(
      screen.queryByDataCy("project-select-options")
    ).not.toBeInTheDocument();
    userEvent.click(screen.queryByDataCy("project-select"));
    expect(screen.getByDataCy("project-select-options")).toBeInTheDocument();
    const options = await screen.findAllByDataCy("project-display-name");
    expect(options).toHaveLength(1);
    expect(screen.queryByText("Disabled Projects")).not.toBeInTheDocument();
  });
});

const mocks = [
  {
    request: {
      query: GET_PROJECTS,
    },
    result: {
      data: {
        projects: [
          {
            groupDisplayName: "evergreen-ci/evergreen",
            projects: [
              {
                id: "evergreen",
                identifier: "evergreen",
                repo: "evergreen",
                owner: "evergreen-ci",
                displayName: "evergreen smoke test",
                isFavorite: false,
              },
            ],
          },
          {
            groupDisplayName: "logkeeper/logkeeper",
            projects: [
              {
                id: "logkeeper",
                identifier: "logkeeper",
                repo: "logkeeper",
                owner: "logkeeper",
                displayName: "logkeeper",
                isFavorite: false,
              },
            ],
          },
          {
            groupDisplayName: "mongodb/mongo",
            projects: [
              {
                id: "sys-perf",
                identifier: "sys-perf",
                repo: "mongo",
                owner: "mongodb",
                displayName: "System Performance (main)",
                isFavorite: false,
              },
              {
                id: "performance",
                identifier: "performance",
                repo: "mongo",
                owner: "mongodb",
                displayName: "MongoDB Microbenchmarks (main)",
                isFavorite: false,
              },
            ],
          },
          {
            groupDisplayName: "mongodb/mongodb",
            projects: [
              {
                id: "mongodb-mongo-master",
                identifier: "mongodb-mongo-master",
                repo: "mongodb",
                owner: "mongodb",
                displayName: "mongo",
                isFavorite: false,
              },
            ],
          },
          {
            groupDisplayName: "mongodb/mongodb-test",
            projects: [
              {
                id: "mongodb-mongo-test",
                identifier: "mongodb-mongo-test",
                repo: "mongodb-test",
                owner: "mongodb",
                displayName: "mongo-test",
                isFavorite: false,
              },
            ],
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_VIEWABLE_PROJECTS,
    },
    result: {
      data: {
        viewableProjectRefs: [
          {
            groupDisplayName: "evergreen-ci/evergreen",
            repo: {
              id: "12345",
            },
            projects: [
              {
                id: "evergreen",
                identifier: "evergreen",
                repo: "evergreen",
                owner: "evergreen-ci",
                displayName: "evergreen smoke test",
                isFavorite: false,
                enabled: false,
              },
              {
                id: "spruce",
                identifier: "spruce",
                repo: "spruce",
                owner: "evergreen-ci",
                displayName: "spruce",
                isFavorite: false,
                enabled: true,
              },
            ],
          },
          {
            groupDisplayName: "logkeeper/logkeeper",
            repo: null,
            projects: [
              {
                id: "logkeeper",
                identifier: "logkeeper",
                repo: "logkeeper",
                owner: "logkeeper",
                displayName: "logkeeper",
                isFavorite: true,
                enabled: true,
              },
            ],
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_VIEWABLE_PROJECTS,
    },
    result: {
      data: {
        viewableProjectRefs: [
          {
            groupDisplayName: "evergreen-ci/evergreen",
            repo: null,
            projects: [
              {
                id: "spruce",
                identifier: "spruce",
                repo: "spruce",
                owner: "evergreen-ci",
                displayName: "spruce",
                isFavorite: false,
                enabled: true,
              },
            ],
          },
        ],
      },
    },
  },
];
