import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'luv-media',

  projectId: '3mt74yqx',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Nội dung')
          .items([
            // Group advertisements into folders
            S.listItem()
              .title('Quảng cáo')
              .child(
                S.list()
                  .title('Quảng cáo')
                  .items([
                    S.listItem()
                      .title('Trang chủ')
                      .child(
                        S.documentList()
                          .title('Trang chủ')
                          .filter(
                            '_type == "advertisement" && position in $positions'
                          )
                          .params({
                            positions: [
                              'main_ads',
                              'sub_ads_1',
                              'sub_ads_2',
                              'hero_main',
                              'hero_left',
                              'hero_right',
                              'catfish_banner',
                              'catfish_banner_2',
                            ],
                          })
                      ),
                    S.listItem()
                      .title('Lịch thi đấu')
                      .child(
                        S.documentList()
                          .title('Lịch thi đấu')
                          .filter(
                            '_type == "advertisement" && position == $position'
                          )
                          .params({position: 'match_schedule_banner'})
                      ),
                    S.listItem()
                      .title('Livestream')
                      .child(
                        S.documentList()
                          .title('Livestream')
                          .filter(
                            '_type == "advertisement" && position in $positions'
                          )
                          .params({
                            positions: ['live_ads_banner_1', 'live_ads_banner_2'],
                          })
                      ),
                    S.divider(),
                    // Fallback to all advertisements
                    S.documentTypeListItem('advertisement').title('Tất cả quảng cáo'),
                  ])
              ),
            // Include the rest of document types except advertisement to avoid duplication
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== 'advertisement'
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
