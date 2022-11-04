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

206
%{
#include "StdH.h"
#include "EntitiesMP/Projectile.h"
%}

class CTeleportField: CRationalEntity {
name      "Teleport Field";
thumbnail "Thumbnails\\Teleport.tbn";
features "HasName", "HasTarget", "IsTargetable", "IsImportant";

properties:

  1 CTString m_strName          "Name" 'N' = "Teleport Field",
  3 CTString m_strDescription = "",
  2 CEntityPointer m_penTarget  "Target" 'T' COLOR(C_BROWN|0xFF),
  6 BOOL m_bActive              "Active" 'A' = TRUE,
  7 BOOL m_bPlayersOnly         "Players only" 'P' = TRUE,
  8 BOOL m_bForceStop           "Force stop" 'F' = FALSE,
  9 BOOL m_bTelefrag            "Telefrag" 'R' = TRUE,
 10 BOOL m_bRelative            "Relative position" 'P' = FALSE,
 11 BOOL m_bShowEffect          "Show effect" 'S' = TRUE,
 12 BOOL m_bBlockNonPlayers       "Block non-players" 'B' = FALSE,  // everything except players cannot pass
{
  CFieldSettings m_fsField;
}


components:

 1 texture TEXTURE_FIELD  "Textures\\Editor\\TeleportField.tex",
 2 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",


functions:

  void SetupFieldSettings(void)
  {
    m_fsField.fs_toTexture.SetData(GetTextureDataForComponent(TEXTURE_FIELD));
    m_fsField.fs_colColor = C_WHITE|CT_OPAQUE;
  }

  CFieldSettings *GetFieldSettings(void) {
    if (m_fsField.fs_toTexture.GetData()==NULL) {
      SetupFieldSettings();      
    }
    return &m_fsField;
  };
  
  const CTString &GetDescription(void) const {
    ((CTString&)m_strDescription).PrintF("-><none>");
    if (m_penTarget!=NULL) {
      ((CTString&)m_strDescription).PrintF("->%s", m_penTarget->GetName());
    }
    return m_strDescription;
  }

  void TeleportEntity(CEntity *pen, const CPlacement3D &pl)
  {
    // teleport back
    pen->Teleport(pl, m_bTelefrag);

	if (m_bShowEffect==TRUE) 
	{
	  // spawn teleport effect
	  ESpawnEffect ese;
	  ese.colMuliplier = C_WHITE|CT_OPAQUE;
	  ese.betType = BET_TELEPORT;
	  ese.vNormal = FLOAT3D(0,1,0);
	  FLOATaabbox3D box;
	  pen->GetBoundingBox(box);
	  FLOAT fEntitySize = box.Size().MaxNorm()*2;
	  ese.vStretch = FLOAT3D(fEntitySize, fEntitySize, fEntitySize);
	  CEntityPointer penEffect = CreateEntity(pl, CLASS_BASIC_EFFECT);
	  penEffect->Initialize(ese);
	}
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CTeleportField) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strName.Length();
    slUsedMemory += m_strDescription.Length();
    return slUsedMemory;
  }


procedures:

  // main initialization
  Main(EVoid) {
    InitAsFieldBrush();
    SetPhysicsFlags(EPF_BRUSH_FIXED);

    SetCollisionFlags( ((ECBI_MODEL|ECBI_PLAYER|ECBI_PROJECTILE_SOLID|ECBI_PROJECTILE_MAGIC)<<ECB_TEST) 
    | ((ECBI_BRUSH)<<ECB_IS) | ((ECBI_PLAYER|ECBI_PROJECTILE_SOLID|ECBI_PROJECTILE_MAGIC)<<ECB_PASS) );
    
    while (TRUE) {
      // wait to someone enter and teleport it
      wait() {
        on (EPass ePass) : {
          if (m_penTarget!=NULL && m_bActive) {
            if (m_bPlayersOnly && !IsOfClass(ePass.penOther, "Player")) {
            resume;
            }

			if (m_bRelative==TRUE)
			{
				CPlacement3D passPlacement = ePass.penOther->GetPlacement();
				CPlacement3D relativePlacement = CPlacement3D(passPlacement.pl_PositionVector, passPlacement.pl_OrientationAngle);
				//relativePlacement.RelativeToRelative(GetPlacement(), m_penTarget->GetPlacement());
				relativePlacement.AbsoluteToRelative(GetPlacement());
				relativePlacement.RelativeToAbsolute(m_penTarget->GetPlacement());
				TeleportEntity(ePass.penOther, relativePlacement);
			}
			else 
			{
				TeleportEntity(ePass.penOther, m_penTarget->GetPlacement());
			}

            if (m_bForceStop && (ePass.penOther->GetPhysicsFlags()&EPF_MOVABLE) ) {
              ((CMovableEntity*)&*ePass.penOther)->ForceFullStop();
            }
            stop;
          }
          resume;
        }
        on (EActivate) : {
          m_bActive = TRUE;
          resume;
        }
        on (EDeactivate) : {
          m_bActive = FALSE;
          resume;
        }
        otherwise() : {
          resume;
        };
      };
      
      // wait a bit to recover
      autowait(0.1f);
    }
  };
};