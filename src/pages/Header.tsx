import { useState } from "react";
import {
  Bars3Icon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

import Button from "../components/Button";
import { useForm } from "../components/Form";
import Modal from "../components/Modal";
import { useAppGlobal } from "../components/AppGlobal";
import { useAuth } from "../lib/auth";
import { useClickOutside } from "../lib/hooks";
import { useDispatch, useSelector } from "../redux/store";

export default function Header() {
  const themeMode = useSelector((state) => state.app.themeMode);
  const page = useSelector((state) => state.app.page);
  const dispatch = useDispatch();

  const auth = useAuth();
  const { showAlert } = useAppGlobal();

  const {
    ref: miniMenuRef,
    isActive: isMiniMenuVisible,
    setActive: setMiniMenuVisible,
  } = useClickOutside(false);
  const {
    ref: accountMenuRef,
    isActive: isAccountMenuVisible,
    setActive: setAccountMenuVisible,
  } = useClickOutside(false);

  const changepwForm = useForm<"oldpw" | "newpw" | "cfmNewpw">();

  const [openLogoutPrompt, setOpenLogoutPrompt] = useState(false);

  async function changePassword() {
    if (!changepwForm.fields.oldpw) {
      changepwForm.setErrors({ oldpw: "Please enter your current password" });
      return;
    }
    if (!changepwForm.fields.newpw) {
      changepwForm.setErrors({ newpw: "Please enter your new password" });
      return;
    }
    if (changepwForm.fields.cfmNewpw !== changepwForm.fields.newpw) {
      changepwForm.setErrors({
        cfmNewpw: "Please ensure your new password matches",
      });
      return;
    }
    if (changepwForm.fields.oldpw === changepwForm.fields.newpw) {
      changepwForm.setErrors({
        newpw: "Your new password is same as your current password",
      });
      return;
    }
    changepwForm.setErrors({});

    const success = await changepwForm.execute(
      auth.changepw(changepwForm.fields.oldpw, changepwForm.fields.newpw)
    );
    if (!success) {
      changepwForm.setErrors({ execute: "Incorrect current password" });
      return;
    }

    changepwForm.clear();
    showAlert({ color: "success", title: "Change Password Successfully" });
  }

  return (
    <>
      {/* Header */}
      <div className="header fixed top-0 left-0 w-full h-16">
        <div className="flex flex-row max-w-4xl h-full px-3 md:px-8 mx-auto gap-4 items-center justify-center">
          {/* Mini menu */}
          <div
            ref={miniMenuRef}
            className="relative md:hidden"
            onClick={() => setMiniMenuVisible(!isMiniMenuVisible)}
          >
            <Bars3Icon className="text w-6 h-6 cursor-pointer" />
            <div className="absolute w-[calc(100vw-2.5rem)]">
              {isMiniMenuVisible && (
                <div className="paper text divider-border flex flex-col mt-2 py-2 select-none">
                  <Button
                    variant={page === "dashboard" ? "filled" : "text"}
                    size="sm"
                    className="py-2 text-left rounded-none"
                    onClick={() => {
                      dispatch({ type: "app/SET_PAGE", page: "dashboard" });
                      setMiniMenuVisible(false);
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={page === "users" ? "filled" : "text"}
                    size="sm"
                    className="py-2 text-left rounded-none"
                    onClick={() => {
                      dispatch({ type: "app/SET_PAGE", page: "users" });
                      setMiniMenuVisible(false);
                    }}
                  >
                    Users
                  </Button>
                  <Button
                    variant={page === "roles" ? "filled" : "text"}
                    size="sm"
                    className="py-2 text-left rounded-none"
                    onClick={() => {
                      dispatch({ type: "app/SET_PAGE", page: "roles" });
                      setMiniMenuVisible(false);
                    }}
                  >
                    Roles
                  </Button>
                  <Button
                    variant={page === "groups" ? "filled" : "text"}
                    size="sm"
                    className="py-2 text-left rounded-none"
                    onClick={() => {
                      dispatch({ type: "app/SET_PAGE", page: "groups" });
                      setMiniMenuVisible(false);
                    }}
                  >
                    Groups
                  </Button>
                  <Button
                    variant={page === "settings" ? "filled" : "text"}
                    size="sm"
                    className="py-2 text-left rounded-none"
                    onClick={() => {
                      dispatch({ type: "app/SET_PAGE", page: "settings" });
                      setMiniMenuVisible(false);
                    }}
                  >
                    Settings
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow" />

          {/* Account button */}
          {auth.session && (
            <div ref={accountMenuRef} className="relative">
              <Button
                variant="outlined"
                size="sm"
                className="flex flex-row items-center gap-2 select-none"
                onClick={() => {
                  setAccountMenuVisible(!isAccountMenuVisible);
                }}
              >
                My Account
                <ChevronDownIcon className="w-4 h-4" />
              </Button>
              <div className="absolute">
                {isAccountMenuVisible && (
                  <div className="paper text divider-border flex flex-col w-max mt-2 py-2 select-none">
                    <Button
                      variant="text"
                      size="sm"
                      className="py-2 text-left rounded-none"
                      onClick={() => {
                        changepwForm.setOpen(true);
                        setAccountMenuVisible(false);
                      }}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="text"
                      size="sm"
                      className="py-2 text-left rounded-none"
                      onClick={() => {
                        setOpenLogoutPrompt(true);
                        setAccountMenuVisible(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Color mode */}
          <div className="select-none">
            {themeMode === "light" && (
              <SunIcon
                className="icon w-6 h-6 cursor-pointer"
                onClick={() =>
                  dispatch({ type: "app/SET_THEME_MODE", themeMode: "dark" })
                }
              />
            )}
            {themeMode === "dark" && (
              <MoonIcon
                className="icon w-6 h-6 cursor-pointer"
                onClick={() =>
                  dispatch({ type: "app/SET_THEME_MODE", themeMode: "light" })
                }
              />
            )}
          </div>
        </div>
        <div className="divider" />
      </div>

      {/* Change password modal */}
      <Modal
        open={changepwForm.open}
        title="Change Password"
        onClose={() => {
          changepwForm.clear();
        }}
      >
        {changepwForm.createTextInput({
          name: "oldpw",
          title: "Current Password",
          autoFocus: true,
          type: "password",
        })}
        {changepwForm.createTextInput({
          name: "newpw",
          title: "New Password",
          type: "password",
        })}
        {changepwForm.createTextInput({
          name: "cfmNewpw",
          title: "Confirm New Password",
          type: "password",
        })}
        {changepwForm.createActions({
          buttons: [
            {
              title: "Change Password",
              onClick: changePassword,
            },
          ],
        })}
      </Modal>

      {/* Confirm logout prompt */}
      <Modal
        open={openLogoutPrompt}
        title="Confirm Logout?"
        onClose={() => {
          setOpenLogoutPrompt(false);
        }}
      >
        <div className="flex flex-row justify-end w-72">
          <Button
            size="sm"
            color="error"
            onClick={() => {
              auth.logout();
              setOpenLogoutPrompt(false);
            }}
          >
            Logout
          </Button>
        </div>
      </Modal>
    </>
  );
}
