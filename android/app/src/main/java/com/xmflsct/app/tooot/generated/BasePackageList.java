package com.xmflsct.app.tooot.generated;

import java.util.Arrays;
import java.util.List;
import org.unimodules.core.interfaces.Package;

public class BasePackageList {
  public List<Package> getPackageList() {
    return Arrays.<Package>asList(
        new expo.modules.application.ApplicationPackage(),
        new expo.modules.constants.ConstantsPackage(),
        new expo.modules.av.AVPackage(),
        new expo.modules.crypto.CryptoPackage(),
        new expo.modules.device.DevicePackage(),
        new expo.modules.errorrecovery.ErrorRecoveryPackage(),
        new expo.modules.filesystem.FileSystemPackage(),
        new expo.modules.firebase.analytics.FirebaseAnalyticsPackage(),
        new expo.modules.firebase.core.FirebaseCorePackage(),
        new expo.modules.font.FontLoaderPackage(),
        new expo.modules.haptics.HapticsPackage(),
        new expo.modules.imageloader.ImageLoaderPackage(),
        new expo.modules.permissions.PermissionsPackage(),
        new expo.modules.imagepicker.ImagePickerPackage(),
        new expo.modules.keepawake.KeepAwakePackage(),
        new expo.modules.lineargradient.LinearGradientPackage(),
        new expo.modules.localization.LocalizationPackage(),
        new expo.modules.location.LocationPackage(),
        new expo.modules.notifications.NotificationsPackage(),
        new expo.modules.screencapture.ScreenCapturePackage(),
        new expo.modules.securestore.SecureStorePackage(),
        new expo.modules.splashscreen.SplashScreenPackage(),
        new expo.modules.sqlite.SQLitePackage(),
        new expo.modules.storereview.StoreReviewPackage(),
        new expo.modules.updates.UpdatesPackage(),
        new expo.modules.videothumbnails.VideoThumbnailsPackage(),
        new expo.modules.webbrowser.WebBrowserPackage()
    );
  }
}
