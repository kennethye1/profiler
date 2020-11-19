/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

// @flow

import React, { PureComponent } from 'react';
import explicitConnect from 'firefox-profiler/utils/connect';

import { DetailsContainer } from './DetailsContainer';
import { ProfileFilterNavigator } from './ProfileFilterNavigator';
import { MenuButtons } from './MenuButtons';
import { WindowTitle } from 'firefox-profiler/shared/WindowTitle';
import { SymbolicationStatusOverlay } from './SymbolicationStatusOverlay';
import { ProfileName } from './ProfileName';
import { BeforeUnloadManager } from './BeforeUnloadManager';
import { KeyboardShortcut } from './KeyboardShortcut';

import { returnToZipFileList } from 'firefox-profiler/actions/zipped-profiles';
import { Timeline } from 'firefox-profiler/timeline';
import { getHasZipFile } from 'firefox-profiler/selectors/zipped-profiles';
import SplitterLayout from 'react-splitter-layout';
import { invalidatePanelLayout } from 'firefox-profiler/actions/app';
import { getTimelineHeight } from 'firefox-profiler/selectors/app';
import {
  getUploadProgress,
  getUploadPhase,
  getIsHidingStaleProfile,
  getHasSanitizedProfile,
} from 'firefox-profiler/selectors/publish';
import { getIconsWithClassNames } from 'firefox-profiler/selectors/icons';
import { BackgroundImageStyleDef } from 'firefox-profiler/shared/StyleDef';
import classNames from 'classnames';
import { DebugWarning } from 'firefox-profiler/app/DebugWarning';

import type { CssPixels, IconWithClassName } from 'firefox-profiler/types';
import type { ConnectedProps } from 'firefox-profiler/utils/connect';

import './ProfileViewer.css';

type StateProps = {|
  +hasZipFile: boolean,
  +timelineHeight: CssPixels | null,
  +uploadProgress: number,
  +isUploading: boolean,
  +isHidingStaleProfile: boolean,
  +hasSanitizedProfile: boolean,
  +icons: IconWithClassName[],
|};

type DispatchProps = {|
  +returnToZipFileList: typeof returnToZipFileList,
  +invalidatePanelLayout: typeof invalidatePanelLayout,
|};

type Props = ConnectedProps<{||}, StateProps, DispatchProps>;

class ProfileViewerImpl extends PureComponent<Props> {
  render() {
    const {
      hasZipFile,
      returnToZipFileList,
      invalidatePanelLayout,
      timelineHeight,
      isUploading,
      uploadProgress,
      isHidingStaleProfile,
      hasSanitizedProfile,
      icons,
    } = this.props;

    return (
      <KeyboardShortcut
        wrapperClassName={classNames({
          profileViewerWrapper: true,
          profileViewerWrapperBackground: hasSanitizedProfile,
        })}
      >
        {icons.map(({ className, icon }) => (
          <BackgroundImageStyleDef
            className={className}
            url={icon}
            key={className}
          />
        ))}
        <div
          className={classNames({
            profileViewer: true,
            profileViewerFadeInSanitized:
              hasSanitizedProfile && !isHidingStaleProfile,
            profileViewerFadeOut: isHidingStaleProfile,
          })}
          style={
            timelineHeight === null
              ? {}
              : {
                  '--profile-viewer-splitter-max-height': `${timelineHeight}px`,
                }
          }
        >
          <div className="profileViewerTopBar">
            {hasZipFile ? (
              <button
                type="button"
                className="profileViewerZipButton"
                title="View all files in the zip file"
                onClick={returnToZipFileList}
              />
            ) : null}
            <ProfileName />
            <ProfileFilterNavigator />
            {
              // Define a spacer in the middle that will shrink based on the availability
              // of space in the top bar. It will shrink away before any of the items
              // with actual content in them do.
            }
            <div className="profileViewerSpacer" />
            <MenuButtons />
            {isUploading ? (
              <div
                className="menuButtonsPublishUploadBarInner"
                style={{ width: `${uploadProgress * 100}%` }}
              />
            ) : null}
          </div>
          <SplitterLayout
            customClassName="profileViewerSplitter"
            vertical
            percentage={false}
            // The DetailsContainer is primary.
            primaryIndex={1}
            // The Timeline is secondary.
            secondaryInitialSize={270}
            onDragEnd={invalidatePanelLayout}
          >
            <Timeline />
            <DetailsContainer />
          </SplitterLayout>
          <WindowTitle />
          <SymbolicationStatusOverlay />
          <BeforeUnloadManager />
          <DebugWarning />
        </div>
      </KeyboardShortcut>
    );
  }
}

export const ProfileViewer = explicitConnect<{||}, StateProps, DispatchProps>({
  mapStateToProps: state => ({
    hasZipFile: getHasZipFile(state),
    timelineHeight: getTimelineHeight(state),
    uploadProgress: getUploadProgress(state),
    isUploading: getUploadPhase(state) === 'uploading',
    isHidingStaleProfile: getIsHidingStaleProfile(state),
    hasSanitizedProfile: getHasSanitizedProfile(state),
    icons: getIconsWithClassNames(state),
  }),
  mapDispatchToProps: {
    returnToZipFileList,
    invalidatePanelLayout,
  },
  component: ProfileViewerImpl,
});
