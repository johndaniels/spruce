import { useMutation } from "@apollo/client";
import styled from "@emotion/styled";
import Card from "@leafygreen-ui/card";
import Toggle from "@leafygreen-ui/toggle";
import { Body } from "@leafygreen-ui/typography";
import { Skeleton } from "antd";
import Cookies from "js-cookie";
import { usePreferencesAnalytics } from "analytics";
import { DISABLE_QUERY_POLLING } from "constants/cookies";
import { size } from "constants/tokens";
import { useToastContext } from "context/toast";
import {
  UpdateUserSettingsMutation,
  UpdateUserSettingsMutationVariables,
} from "gql/generated/types";
import { UPDATE_USER_SETTINGS } from "gql/mutations";
import { useUserSettings } from "hooks";

export const NewUITab: React.VFC = () => {
  const { sendEvent } = usePreferencesAnalytics();
  const { userSettings, loading } = useUserSettings();
  const { spruceV1 } = userSettings?.useSpruceOptions ?? {};
  const dispatchToast = useToastContext();
  const [updateUserSettings, { loading: updateLoading }] = useMutation<
    UpdateUserSettingsMutation,
    UpdateUserSettingsMutationVariables
  >(UPDATE_USER_SETTINGS, {
    onCompleted: () => {
      dispatchToast.success(`Your changes have successfully been saved.`);
    },
    onError: (err) => {
      dispatchToast.error(`Error while saving settings: '${err.message}'`);
    },
  });

  if (loading) {
    return <Skeleton active />;
  }

  const handleOnChangeNewUI = (c: boolean) => {
    sendEvent({
      name: c ? "Opt into Spruce" : "Opt out of Spruce",
    });
    updateUserSettings({
      variables: {
        userSettings: {
          useSpruceOptions: {
            spruceV1: c,
          },
        },
      },
      refetchQueries: ["GetUserSettings"],
    });
  };

  const handleOnChangePolling = () => {
    const nextState = Cookies.get(DISABLE_QUERY_POLLING) !== "true";
    sendEvent({
      name: "Toggle polling",
      value: nextState ? "Enabled" : "Disabled",
    });
    Cookies.set(DISABLE_QUERY_POLLING, nextState.toString());
    window.location.reload();
  };

  return (
    <>
      {/* @ts-expect-error */}
      <PreferencesCard>
        <PaddedBody>
          Direct all inbound links to the new Evergreen UI, whenever possible
          (e.g. from the CLI, GitHub, etc.).
        </PaddedBody>
        <Toggle
          checked={spruceV1}
          disabled={updateLoading}
          onChange={handleOnChangeNewUI}
          aria-label="Toggle new evergreen ui"
        />
      </PreferencesCard>
      {/* @ts-expect-error */}
      <PreferencesCard>
        <PaddedBody>
          Allow background polling for active tabs in the current browser.
        </PaddedBody>
        <Toggle
          checked={Cookies.get(DISABLE_QUERY_POLLING) !== "true"}
          onChange={handleOnChangePolling}
          aria-label="Toggle new evergreen ui"
        />
      </PreferencesCard>
    </>
  );
};

// @ts-expect-error
const PreferencesCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: ${size.m};
  margin-bottom: ${size.m};
  width: 100%;
`;

const PaddedBody = styled(Body)`
  padding-bottom: ${size.l};
`;
