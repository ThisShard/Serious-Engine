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

class CWorldLinkTrigger : CRationalEntity {
name      "WorldLinkTrigger";
thumbnail "Thumbnails\\WorldLink.tbn";
features  "HasName", "HasTarget";

properties:
  1 CTString m_strName               "Name" 'N' = "Marker",
  2 CTString m_strFlagName           "Flag name" 'G' = "",
  4 enum EventEType m_eetEvent     "Event type" 'G' = EET_TRIGGER,
  3 CEntityPointer m_penTarget       "Target" 'T' COLOR(C_RED|0xFF),

components:
  1 model   MODEL_WORLDLINK     "Models\\Editor\\WorldLink.mdl",
  2 texture TEXTURE_WORLDLINK   "Models\\Editor\\WorldLink.tex"


functions:

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CWorldLinkTrigger) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strName.Length();
    slUsedMemory += m_strFlagName.Length();
    return slUsedMemory;
  }



procedures:

  SendEventToTarget() {
    BOOL shouldTrigger = FALSE;
    
    {FOREACHINDYNAMICARRAY(_SwcWorldChange.storedFlags, CTString, ites) {
      CTString &flag = *ites;

      if (flag == m_strFlagName){
        shouldTrigger = TRUE;
      }
    }}

    if (!shouldTrigger)
    {
      return;
    }

    SendToTarget(m_penTarget, m_eetEvent, this);
    return;
  };

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
    m_strName.PrintF("World link trigger - %s", m_strFlagName);

    
    wait() {
      on (EPostLevelChange) : {
        call SendEventToTarget(); 
      }
    }
  }
};
