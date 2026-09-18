from pathlib import Path
import shutil

profile = Path("src/components/ProfilePanel.jsx")
account = Path("src/pages/AccountPage.jsx")

def backup(path):
    backup_path = path.with_suffix(path.suffix + ".backup-before-auth-display")
    if not backup_path.exists():
        shutil.copy2(path, backup_path)

backup(profile)
backup(account)

profile_text = profile.read_text(encoding="utf-8-sig")

profile_helper = '''const getAuthMethodLabel = (user) => {
  const provider = String(user?.app_metadata?.provider || "").toLowerCase();
  const username =
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.username;

  if (provider.includes("telegram")) {
    return username ? `Telegram · @${username}` : "Telegram";
  }

  if (user?.email) {
    return user.email;
  }

  return "Способ входа не указан";
};

'''

if "const getAuthMethodLabel" not in profile_text:
    profile_text = profile_text.replace(
        '﻿export default function ProfilePanel',
        '﻿' + profile_helper + 'export default function ProfilePanel',
        1
    )

profile_text = profile_text.replace(
    '<p>{user?.email || "Telegram аккаунт"}</p>',
    '<p>{getAuthMethodLabel(user)}</p>',
    1
)

profile_text = profile_text.replace(
    '<span>Email</span>\n              <strong>{user?.email || "Не указан"}</strong>',
    '<span>Способ входа</span>\n              <strong>{getAuthMethodLabel(user)}</strong>',
    1
)

profile.write_text(profile_text, encoding="utf-8")

account_text = account.read_text(encoding="utf-8-sig")

account_helper = '''const getAuthMethodLabel = (user) => {
  const provider = String(user?.app_metadata?.provider || "").toLowerCase();
  const username =
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.username;

  if (provider.includes("telegram")) {
    return username ? `Telegram · @${username}` : "Telegram";
  }

  if (user?.email) {
    return user.email;
  }

  return "Способ входа не указан";
};

'''

if "const getAuthMethodLabel" not in account_text:
    account_text = account_text.replace(
        '﻿import { Link, useOutletContext } from "react-router-dom";',
        '﻿import { Link, useOutletContext } from "react-router-dom";\n\n' + account_helper,
        1
    )

account_text = account_text.replace(
    '<p>{user.email || "Email не указан"}</p>',
    '<p>{getAuthMethodLabel(user)}</p>',
    1
)

account_text = account_text.replace(
    '<span>Email</span>\n            <strong>{user.email || "Не указан"}</strong>',
    '<span>Способ входа</span>\n            <strong>{getAuthMethodLabel(user)}</strong>',
    1
)

account.write_text(account_text, encoding="utf-8")

print("ProfilePanel.jsx и AccountPage.jsx обновлены")
