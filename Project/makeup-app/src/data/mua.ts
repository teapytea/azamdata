export type MuaProfile = {
  id: string
  name: string
  area: string
  startingPrice: string
  rating: string
  available: boolean
  verified: boolean
  portfolioImage: string
}

export const recommendedMuas: readonly MuaProfile[] = [
  {
    id: 'nabila-makeup-art',
    name: 'Nabila Makeup Art',
    area: 'Gubeng, Surabaya',
    startingPrice: 'Rp650.000',
    rating: '4.9',
    available: true,
    verified: true,
    portfolioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB79Fl6Q-4UGveocdtAqNSxd7cLJOQbALmab5W-iTNSHjwqNVi41eOhXX_m01R910yOAKsub9vnjn67l51NHPBsj-aBIGmTgTJ37WPDkbtZZYQn_jHN3qU_IwxyxD9dlxeezoT2aoOO86Pd7GG5Elze77qX_Sv19CmGHmV86VdlIiiVb5NGCpM9eKz2gjBWiiz1TxWnbGDIKrFWI264cPWFfY2jMUGn29KjGsTGf_IpvUzch6eELrlBoA',
  },
  {
    id: 'studio-cantik-rina',
    name: 'Studio Cantik Rina',
    area: 'Rungkut, Surabaya',
    startingPrice: 'Rp450.000',
    rating: '4.8',
    available: true,
    verified: true,
    portfolioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCueanSELgJ1GDadbV_8ogkYKWhBkN0l3QryaaaYNwfHDTPS4zy-TnEJWdhXLq2pqt3fuqQlnQbbcA1JOA6vuWa47aLGzO938K9YsH6dC70phwk2_0qkdsNFj9n7_uczftjdpVl7O5B_i5O4nvjC2KW-_95U-xualvqsVcFPyeZugA9arMSIaJwGR-4TPLZF0z6bk0H81GVfBmXyP6286eDZcuKMnpbRaQNY4AggRU65FK6LGAwZnihCA',
  },
  {
    id: 'ayu-mua',
    name: 'Ayu MUA',
    area: 'Mulyorejo, Surabaya',
    startingPrice: 'Rp800.000',
    rating: '5.0',
    available: true,
    verified: true,
    portfolioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCiM2wW4t3bzk1JJDi-w6ALn1HluQWJ07JTa_ekSwJLoLZf5VXxEt39iYnfP04ciQ4fUPXCB9L9uo8fDSEN-710BZV5Y2TPoTTZCjLgTScxJWjwFd0yyU53ahH8lIj8z0JdVRtYYFaWGGgKQAsku2COkkJjou7iRYSyijoWY469n4kXa6ZHDRXWZ_sx2XwjULKcNeU55ejDZw30kfqI77mMmIlrl7RT_6rRo5P76mYH4Gs6RufA4fNvIQ',
  },
]

export const searchMuas: readonly MuaProfile[] = [
  {
    id: 'alya-lestri-artistry',
    name: 'Alya Lestri Artistry',
    area: 'Tegalsari, Surabaya',
    startingPrice: 'Rp350.000',
    rating: '4.9',
    available: true,
    verified: true,
    portfolioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB98IutbNNs284VM6SGmmER2N0hRDbx4bvTqs21aQW56pm-LXd_rB8Ll2oalFuKXFxXcryq1bBgGrhAYN8YlaKL80gCcqU5hw4R5H7dIpSlmv5RFn0vi_PY5rNQeVFX_NkmeuL0QnoFlrqZ6CA_niIWT4KhDUVAhonqy7Xtv7s_SXACsHx9bNzJLVEGXCWeTQpdbiXtq8iAGMuO6-2-iVcGhzFylxKBs2u8cySjS-A990XsY9Ue0p3ovQ',
  },
  {
    id: 'bella-beauty-studio',
    name: 'Bella Beauty Studio',
    area: 'Sukolilo, Surabaya',
    startingPrice: 'Rp400.000',
    rating: '4.8',
    available: true,
    verified: true,
    portfolioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA5xk33gX6rPZNRKLgN4b7mGNJLvAA3ecL-qpxlZVmaebSEDgu2drL1y5egsiwDElTOyE64H2bVSOrgs-Xh9dtskxDaUev_5dUXplJLCJOh9SzGf7p9M-2TCQ5Hz-ecVQBt9mCRSC14sEQLgub7DcCDxj8_I_96SjeT1P__nF7Y9tHAwrzG4NFH5lvX4RUM5Bpx0QKX4oDRQyvpOiC-JuX4vcfGe8VBA8k0mDLhQbv-FGch0T1QApBHEg',
  },
  {
    id: 'citra-mua-surabaya',
    name: 'Citra MUA Surabaya',
    area: 'Wonokromo, Surabaya',
    startingPrice: 'Rp300.000',
    rating: '4.9',
    available: true,
    verified: true,
    portfolioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZE_xB2DtFyJCT4pDbyy3MG3e4jp1tPc99fwvZIjEUpaXwpL3wC_1tTMFm2afhLJRJIgB5GVhm9cP96CtH_9wMrxr34PJOP0gPpNj3ngPHy_vctbRjf81EmQs5mGm6Zwggcl_qiel2d39czXfTKbaRHIcOyeL6Xbqd5GBhfWfyzjjz_X-n1-a0Z7YfXs7mCfI51PtzItaAVRoHKQn2BUq2otLADuBKz7ttU3zmTrV6dCdzwSiktJ1aNg',
  },
]

export const alviaPortfolio = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8p442_blwBTkgUBjmPsuz6ix23vJO3d9klXMCKnLgy5ex_eEGo-EV0q5Z3k2UOq9hrhq3tBgL-xjCIGKTb7dbcZDIsHh2b9eK6luN0_dPBMRSGdcozj87fW-EBtZICMsK7ti4ImM235YETZCPx-uuewYD_AY99a7-kkxox7nusxC8Kq951Tc_Lz9W2vfwBH18WbKv8E5-zy0AD-Y4GwMBWEJoh_33U7X0IYPchLuryUGySuviEfGehQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCxU1_X40DbBCk1Yxv9kLSRJACfK53VspZirw5fYHfcwKbfhadzpx9icKez_baMducnaggfGyLjbpCPysyImF8qtrprDDy1VmJ9xpgvdKyY9DhZcE0J5OnKB2L0bwTy_ZIKJOxn29D7qLymuuzi21aHm-zmvBqKfYu9aKuXHBlGzXes2LyZ2LBKwaDcYMKvrHPI0sId2uwA2gkSYHnsMVX0dIm8j67Yu9hX89Dxjxr7BaIRWq6fAwQY-g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA__QDfHRf2S4GjmVH-2XiQAVoIsFWW_nt6w7UyZDvbJh65CWv10j3yAjkqK75qK1cdCQyUlIdSE1MMT6or9x5RG2j4Y5Fuwrc22gFIykmxZ7RYvplLLmkK3qISW6Y4227SxCrPFgHAk7F7O7AU45jZm4kJMwMi7KeLvx0CuD0a1aMtu7LZtZlrCHoYsGxGteaJubl4w31OR769Fgw6Ig5zSnKYZJgciLbiO-PrDg1DZH0OXJMuzmZGTQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDMXBd5j-wyHpnHt2pZzNMMrCP5wzOerOSxjORI64_hU8szybU1o9DlgIfAHSsXYGJdXXRNYNxQMb1XD-eaqNbfAvPwRx-ETaD1EjOPmdo2cTX7HScQMw_77DT5ltxxTbrsXYkjbZoAxsDDCRfZ2a60eFe_p4lU-8pncxHtrxyhBe782BKGKZOpDP1fmOqTOoGvae_NxkbccKJch09zO6PH1Zi74f99f0zdoZaqmzJ5ZPKpyYOfdwKXTQ',
] as const
