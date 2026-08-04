package com.diagnosticapp

import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ProgressBar
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash
import com.zoontek.rnbootsplash.RNBootSplashView

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "DiagnosticApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootTheme)
    // Posted (not called inline) so it queues on the main thread strictly after the splash
    // view RNBootSplash.init() just scheduled, guaranteeing the spinner draws on top of it.
    Handler(Looper.getMainLooper()).post { addSplashSpinner() }
    super.onCreate(savedInstanceState)
  }

  /**
   * RNBootSplash's static logo has no built-in loading indicator, and a blank/static screen
   * during JS bundle load reads as broken. This overlays a small spinner on the splash itself,
   * removed automatically the moment RNBootSplash removes its own view (on BootSplash.hide()).
   */
  private fun addSplashSpinner() {
    val decorView = window.decorView as? ViewGroup ?: return

    val spinner = ProgressBar(this).apply {
      isIndeterminate = true
      indeterminateTintList = ColorStateList.valueOf(Color.parseColor("#C1652B"))
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
        Gravity.CENTER_HORIZONTAL or Gravity.BOTTOM,
      ).apply {
        bottomMargin = (resources.displayMetrics.density * 72).toInt()
      }
    }

    decorView.addView(spinner)

    decorView.setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
      override fun onChildViewAdded(parent: View, child: View) {}

      override fun onChildViewRemoved(parent: View, child: View) {
        if (child is RNBootSplashView) {
          decorView.removeView(spinner)
          decorView.setOnHierarchyChangeListener(null)
        }
      }
    })
  }
}
