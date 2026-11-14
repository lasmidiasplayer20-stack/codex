def apply(b,original,report):
    # Bank 83 padding. All seven LDY/LDX immediate references to ON audited.
    slot=0x3ff90
    assert len(set(original[slot:slot+4]))==1 and original[slot] in (0,255)
    b[slot:slot+4]=b'SIM\0'
    refs=[0x3c003,0x3c302,0x3cae9,0x3cb76,0x3cf14,0x3cf36,0x3d041]
    for off in refs:
        assert original[off-1] in (0xa0,0xa2) and original[off:off+2]==bytes.fromhex('51d6')
        b[off:off+2]=bytes.fromhex('90ff')
    report.append({'offset':hex(slot),'en':'ON','pt_BR':'SIM','relocated_pointer_sites':[hex(x) for x in refs]})
    from graphics import hud_patch
    packed,edits=hud_patch(original)
    slot=0x23eecb
    available=0x23f261-slot
    assert len(packed)<=available
    b[slot:slot+len(packed)]=packed
    report.append({'graphics_resource':hex(slot),'edits':edits})
