/* Copyright (c) 2002-2012 Croteam Ltd. 
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */

214
%{
#include "StdH.h"
%}

class CLinkFlag : CEntity {
name      "WorldLinkFlag";
thumbnail "Thumbnails\\WorldLink.tbn";
features  "HasName", "IsTargetable";

properties:
  1 CTString m_strFlagName           "Flag name" 'G' = "",
  3 BOOL m_bIsActivated              "Flag is activated" 'S' = FALSE,

components:
  1 model   MODEL_WORLDLINK     "Models\\Editor\\WorldLink.mdl",
  2 texture TEXTURE_WORLDLINK   "Models\\Editor\\WorldLink.tex"


functions:
/************************************************************
 *                      START EVENT                         *
 ************************************************************/
  BOOL HandleEvent(const CEntityEvent &ee) {
    if (ee.ee_slEvent == EVENTCODE_ETrigger) {
      m_bIsActivated = TRUE;
      return TRUE;
    }
    if (ee.ee_slEvent == EVENTCODE_EStart) {
      m_bIsActivated = TRUE;
      return TRUE;
    }
    if (ee.ee_slEvent == EVENTCODE_EStop) {
      m_bIsActivated = FALSE;
      return TRUE;
    }
    return FALSE;
  };
  
  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CWorldLinkFlag) - sizeof(CEntity) + CEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strFlagName.Length();
    slUsedMemory += m_bIsActivated.Length();
    return slUsedMemory;
  }

procedures:
/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_WORLDLINK);
    SetModelMainTexture(TEXTURE_WORLDLINK);

    // set name
    m_strName.PrintF("World link flag - %s", m_strFlagName);

    return;
  }
};
